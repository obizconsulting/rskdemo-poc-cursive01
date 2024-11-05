import { Component, OnInit, Inject } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HttpClientModule]
})
export class AppComponent implements OnInit {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private points: { x: number, y: number }[] = [];
  private segments: { x: number, y: number }[][] = [];
  private originalStrokeStyle = 'black';
  private mode: 'draw' | 'select' | 'drag' | 'rotate' = 'draw';
  private selectedSegment: { x: number, y: number }[] | null = null;
  private dragOffset: { x: number, y: number } | null = null;
  private rotationCenter: { x: number, y: number } | null = null;
  private sliderValue = 0;
  private isolatedSegments: { x: number, y: number }[][] = [];

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

      this.canvas.addEventListener('mousedown', (e) => {
        if (this.mode === 'draw') {
          this.drawing = true;
          this.points.push({ x: e.offsetX, y: e.offsetY });
          this.ctx.beginPath();
          this.ctx.moveTo(e.offsetX, e.offsetY);
        } else if (this.mode === 'select') {
          const clickedPoint = { x: e.offsetX, y: e.offsetY };
          this.selectSegment(clickedPoint);
        } else if (this.mode === 'drag' && this.selectedSegment) {
          const clickedPoint = { x: e.offsetX, y: e.offsetY };
          this.dragOffset = { x: clickedPoint.x - this.selectedSegment[0].x, y: clickedPoint.y - this.selectedSegment[0].y };
        } else if (this.mode === 'rotate' && this.selectedSegment) {
          this.rotationCenter = { x: e.offsetX, y: e.offsetY };
        }
      });

      this.canvas.addEventListener('mousemove', (e) => {
        if (this.drawing && this.mode === 'draw') {
          const point = { x: e.offsetX, y: e.offsetY };
          this.points.push(point);
          this.ctx.lineTo(point.x, point.y);
          this.ctx.stroke();
          this.updateSVGCode();
        } else if (this.mode === 'drag' && this.selectedSegment && this.dragOffset) {
          const newPoint = { x: e.offsetX - this.dragOffset.x, y: e.offsetY - this.dragOffset.y };
          this.moveSegment(this.selectedSegment, newPoint);
          this.updateSVGCode();
          this.updateCanvas();
        } else if (this.mode === 'rotate' && this.selectedSegment && this.rotationCenter) {
          const angle = Math.atan2(e.offsetY - this.rotationCenter.y, e.offsetX - this.rotationCenter.x);
          this.rotateSegment(this.selectedSegment, angle);
          this.updateSVGCode();
          this.updateCanvas();
        }
      });

      this.canvas.addEventListener('mouseup', (e) => {
        if (this.mode === 'draw') {
          this.drawing = false;
          this.segments.push([...this.points]);
          this.points = [];
          this.updateSVGCode();
          this.updateNormalizedSVG();
        } else if (this.mode === 'drag') {
          this.dragOffset = null;
        } else if (this.mode === 'rotate') {
          this.rotationCenter = null;
        }
      });
    }
  }

  saveStroke() {
    const svgPath = this.segmentsToSVGPath(this.segments);
    this.http.post('/api/strokes/save', { svgPath }).subscribe(response => {
      console.log('Stroke saved');
    });
  }

  segmentsToSVGPath(segments: { x: number, y: number }[][]): string {
    return segments.map(points => this.pointsToSVGPath(points)).join(' ');
  }

  pointsToSVGPath(points: { x: number, y: number }[]): string {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }

  updateSVGCode() {
    const svgPath = this.segmentsToSVGPath(this.segments);
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="${svgPath}" fill="none" stroke="black"/></svg>`;
    const svgCodeElement = document.getElementById('svg-code') as HTMLTextAreaElement;
    svgCodeElement.value = svgPath;
  }

  updateNormalizedSVG() {
    const normalizedSegments = this.segments.map(points => this.normalizePoints(points));
    const normalizedPath = this.segmentsToSVGPath(normalizedSegments);
    const normalizedSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="${normalizedPath}" fill="none" stroke="black"/></svg>`;
    const normalizedSVGElement = document.getElementById('normalized-svg') as HTMLTextAreaElement;
    normalizedSVGElement.value = normalizedSVG;
  }

  normalizePoints(points: { x: number, y: number }[]): { x: number, y: number }[] {
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));
    const width = maxX - minX;
    const height = maxY - minY;

    return points.map(p => ({
      x: (p.x - minX) / width,
      y: (p.y - minY) / height
    }));
  }

  highlightSelectedPath() {
    const svgCodeElement = document.getElementById('svg-code') as HTMLTextAreaElement;
    const selectedText = svgCodeElement.value.substring(svgCodeElement.selectionStart, svgCodeElement.selectionEnd);

    const pathMatch = selectedText.match(/M\s*([\d.]+)\s*([\d.]+)(?:\s*L\s*([\d.]+)\s*([\d.]+))*/g);
    if (pathMatch) {
      const points = pathMatch.map(segment => {
        const coords = segment.match(/[\d.]+/g);
        if (coords) {
          return coords.map((coord, index) => ({
            x: parseFloat(coords[index * 2]),
            y: parseFloat(coords[index * 2 + 1])
          }));
        }
        return [];
      }).flat();
      this.highlightPath(points);
    }
  }

  highlightPath(points: { x: number, y: number }[]) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.originalStrokeStyle;
      this.ctx.lineWidth = 1;
      this.segments.forEach(segment => {
        if (segment.length > 0) {
          this.ctx.moveTo(segment[0].x, segment[0].y);
          segment.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
          });
        }
      });
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      if (points.length > 0) {
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
          this.ctx.lineTo(point.x, point.y);
        });
      }
      this.ctx.stroke();

      // Reset pen color
      this.ctx.strokeStyle = this.originalStrokeStyle;
    }
  }

  selectSegment(clickedPoint: { x: number, y: number }) {
    const tolerance = 5; // Adjust as needed
    for (const segment of this.segments) {
      for (const point of segment) {
        if (Math.abs(point.x - clickedPoint.x) < tolerance && Math.abs(point.y - clickedPoint.y) < tolerance) {
          this.selectedSegment = segment;
          const svgPath = this.pointsToSVGPath(segment);
          const svgCodeElement = document.getElementById('svg-code') as HTMLTextAreaElement;
          svgCodeElement.value = svgPath;
          this.highlightPath(segment);
          return;
        }
      }
    }
  }

  moveSegment(segment: { x: number, y: number }[], newPoint: { x: number, y: number }) {
    const dx = newPoint.x - segment[0].x;
    const dy = newPoint.y - segment[0].y;
    for (const point of segment) {
      point.x += dx;
      point.y += dy;
    }
  }

  rotateSegment(segment: { x: number, y: number }[], angle: number) {
    const centerX = segment.reduce((sum, point) => sum + point.x, 0) / segment.length;
    const centerY = segment.reduce((sum, point) => sum + point.y, 0) / segment.length;
    for (const point of segment) {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      point.x = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
      point.y = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
    }
  }

  updateCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.originalStrokeStyle;
    this.ctx.lineWidth = 1;
    this.segments.forEach(segment => {
      if (segment.length > 0) {
        this.ctx.moveTo(segment[0].x, segment[0].y);
        segment.forEach(point => {
          this.ctx.lineTo(point.x, point.y);
        });
      }
    });
    this.ctx.stroke();
  }

  updateSlider(event: Event) {
    const input = event.target as HTMLInputElement;
    this.sliderValue = parseInt(input.value, 10);
    this.highlightPathBySlider();
  }

  highlightPathBySlider() {
    if (this.selectedSegment) {
      const pointsToHighlight = this.selectedSegment.slice(0, Math.floor(this.selectedSegment.length * (this.sliderValue / 100)));
      this.highlightPath(pointsToHighlight);
    }
  }

  isolateSegment() {
    if (this.selectedSegment) {
      const normalizedSegment = this.normalizePoints(this.selectedSegment);
      const normalizedPath = this.pointsToSVGPath(normalizedSegment);
      const normalizedSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="${normalizedPath}" fill="none" stroke="black"/></svg>`;
      const normalizedSVGElement = document.getElementById('normalized-svg') as HTMLTextAreaElement;
      normalizedSVGElement.value = normalizedSVG;

      // Save to temporary table
      this.isolatedSegments.push(normalizedSegment);
      this.updateSegmentsTable();
    }
  }

  updateSegmentsTable() {
    const tableBody = document.querySelector('#segments-table tbody') as HTMLTableElement;
    tableBody.innerHTML = '';
    this.isolatedSegments.forEach((segment, index) => {
      const row = tableBody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.textContent = JSON.stringify(segment);
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        this.isolatedSegments.splice(index, 1);
        this.updateSegmentsTable();
      });
      cell2.appendChild(deleteButton);
    });
  }

  saveToDynamoDB() {
    const metadata = {
      timestamp: new Date().toISOString(),
      user: 'exampleUser'
    };
    const data = {
      metadata,
      segments: this.isolatedSegments
    };
    this.http.post('/api/dynamodb/save', data).subscribe(response => {
      console.log('Data saved to DynamoDB');
    });
  }

  switchToDrawMode() {
    this.mode = 'draw';
  }

  switchToSelectMode() {
    this.mode = 'select';
  }

  switchToDragMode() {
    this.mode = 'drag';
  }

  switchToRotateMode() {
    this.mode = 'rotate';
  }
}