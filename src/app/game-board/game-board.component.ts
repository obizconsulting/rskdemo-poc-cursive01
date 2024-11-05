import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-board',
  standalone: true,
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit {
  public winnings: number[] = [];
  private turn = 'x';

  private readonly possibilities: { [key: string]: number[][] } = {
    '0': [[0, 1, 2], [0, 3, 6], [0, 4, 8]],
    '1': [[0, 1, 2], [1, 4, 7]],
    '2': [[0, 1, 2], [2, 5, 8], [2, 4, 6]],
    '3': [[3, 4, 5], [0, 3, 6]],
    '4': [[3, 4, 5], [1, 4, 7], [0, 4, 8], [2, 4, 6]],
    '5': [[2, 5, 8], [3, 4, 5]],
    '6': [[0, 3, 6], [6, 7, 8], [2, 4, 6]],
    '7': [[1, 4, 7], [6, 7, 8]],
    '8': [[2, 5, 8], [6, 7, 8], [0, 4, 8]]
  };

  public moves = ['', '', '', '', '', '', '', '', ''];
  public msg = '';
  public sts = 'running';

  public restart() {
    this.moves.fill('');
    this.winnings = [];
    this.turn = 'x';
    this.msg = `Player ${this.turn == 'x' ? '0' : 'x'} Turn`;
    this.sts = 'running';
  }

  constructor() { }

  ngOnInit(): void {
    this.msg = `Player ${this.turn == 'x' ? '0' : 'x'} Turn`;
  }

  cellClick(cl: number) {
    if (this.sts == 'running') {
      if (!this.moves[cl].length) {
        this.msg = `Player ${this.turn} Turn`;
        this.moves[cl] = this.turn == 'x' ? this.turn = '0' : this.turn = 'x';
        this.possibilities[cl.toString()].forEach((arr: Array<number>) => {
          if (this.isWin(arr)) {
            this.msg = `Player ${this.turn} Won`;
            this.sts = 'win';
            this.winnings = arr.slice();
          }
        });
      }
    } else {
      this.msg = `Please Restart The Game`;
    }
  }

  img(turn: string) {
    if (turn.length)
      return turn == 'x' ? '../../tic-tac-toe/assets/cross.svg' : '../../tic-tac-toe/assets/circle.svg';
    return turn;
  }

  isInWinning(cell: number) {
    return this.winnings.includes(cell);
  }

  private isWin(arr: Array<number>) {
    return arr.every(el => this.moves[el] === this.turn);
  }
}