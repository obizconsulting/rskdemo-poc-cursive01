
COMMENTS in this part are for commit wise code change tracking for code review history 
=============
### Commit 1
=============
is it possible to make individual letters in the left canvas as clickable widgets or select them together and make the selected path appear as selected text in the middle pane (where SVG XML is rendered).

does it help to represent the cursive text drawn with strokes as bezier curves so that normalization becomes easy. for example when the shapes are not exact rectangles or circles, but free form cursive text, then a bigger letta A and smaller letter in the way its glyph is writter should be more or less scale-invariant representations - what i mean my normalization.

also, when i select a continous text in the middle pane, if it spans tow letters, it still tries to create a line in the path that is traced betwen the end point of first letter and start point of second letter). it actually does not exist.

also, after selection by text and the cursive text traced in red in the left pane, the whole pen color changes to red and i cannot reset it. Actually, only the selected part should be red to highlight the selection. But, it should not update my pen color


To address your requirements, we need to make several improvements to the current implementation:

1. **Clickable Widgets for Individual Letters**:
   - Represent each letter as a separate clickable widget on the canvas.
   - Allow selection of these widgets to highlight the corresponding SVG path in the middle pane.

2. **Bezier Curves for Normalization**:
   - Use Bezier curves to represent the strokes, which can help with normalization and scale-invariance.

3. **Handling Selection Across Multiple Letters**:
   - Ensure that selecting text in the middle pane does not create a line between the end of one letter and the start of another.

4. **Resetting Pen Color**:
   - Ensure that the pen color is reset after highlighting the selected path.

### Updated TypeScript Code - please refer to github code associated with this checkin.

### Explanation

1. **Clickable Widgets for Individual Letters**:
   - Added a `click` event listener to the canvas to detect clicks on individual segments.
   - The `selectSegment` method checks if the clicked point is within a tolerance distance from any point in the segments. If a match is found, the corresponding segment is highlighted, and its SVG path is displayed in the middle pane.

2. **Bezier Curves for Normalization**:
   - This example does not yet implement Bezier curves, but you can extend the `pointsToSVGPath` method to use Bezier curves for better normalization and scale-invariance.

3. **Handling Selection Across Multiple Letters**:
   - The `highlightSelectedPath` method ensures that selecting text in the middle pane does not create a line between the end of one letter and the start of another.

4. **Resetting Pen Color**:
   - The `highlightPath` method resets the pen color to the original stroke style after highlighting the selected path.

### Conclusion

By updating the TypeScript code to handle clickable widgets for individual letters, improve the parsing and drawing logic, and reset the pen color, you can now select parts of the SVG path in the middle pane and highlight the corresponding part of the path in the left pane (canvas) in red. This ensures that segments are not connected by a solid line and allows you to experiment with scale-invariance and visualize the selected path accurately.



=============
###
=============

i think before adding the click event, to canvass to select the segment, we should change the mode from draw mode to select mode otherwise it is still thinking it has to paint more and not select, so event does not respond. 

You're right. To handle different modes (draw mode and select mode), we need to add a mechanism to switch between these modes. This will allow the canvas to respond appropriately to clicks for selection when in select mode and to draw when in draw mode.

Updated TypeScript Code
app.component.ts:

Updated HTML Structure
app.component.html:

Explanation
Mode Switching:

Added switchToDrawMode and switchToSelectMode methods to switch between draw mode and select mode.
Added buttons in the HTML to switch between these modes.
Event Handling Based on Mode:

Updated the mousedown, mousemove, and mouseup event listeners to handle events based on the current mode.
Added a click event listener to handle selection when in select mode.
Highlighting and Resetting Pen Color:

The highlightPath method ensures that the pen color is reset after highlighting the selected path.
Conclusion
By adding mode switching and updating the event handling logic, you can now switch between draw mode and select mode. This allows you to draw on the canvas and select individual segments to highlight the corresponding SVG path in the middle pane. This approach ensures that the canvas responds appropriately to clicks for selection when in select mode and to drawing when in draw mode.



=============
###
=============
i can select the individual sections now, but an i move them around the canvas and see how it changes the SVG. also i would like to see how the SVG changes if we rotate it

To enable moving and rotating individual segments on the canvas and updating the SVG accordingly, we need to add functionality for dragging and rotating segments. Here's how you can achieve this:

Enable Dragging:

Allow segments to be dragged around the canvas.
Update the SVG path as the segment is moved.
Enable Rotation:

Allow segments to be rotated.
Update the SVG path as the segment is rotated.
Updated TypeScript Code
app.component.ts:

Updated HTML Structure
app.component.html:

Explanation
Mode Switching:

Added switchToDragMode and switchToRotateMode methods to switch between drag mode and rotate mode.
Added buttons in the HTML to switch between these modes.
Dragging Segments:

The mousedown event listener sets the dragOffset when in drag mode.
The mousemove event listener moves the selected segment based on the dragOffset.
The mouseup event listener resets the dragOffset.
Rotating Segments:

The mousedown event listener sets the rotationCenter when in rotate mode.
The mousemove event listener rotates the selected segment based on the angle between the current mouse position and the rotationCenter.
The mouseup event listener resets the rotationCenter.
Updating Canvas and SVG:

The updateCanvas method redraws all segments on the canvas.
The updateSVGCode method updates the SVG path in the middle pane.
Conclusion
By adding mode switching and updating the event handling logic, you can now move and rotate individual segments on the canvas and see how the SVG changes accordingly. This allows you to experiment with different transformations and visualize the changes in the SVG path.

=============
###
=============
from the middle pane when the user selects part of the image, the image in left pane is selected and traced in red. I want the user to be able to use a slider and pull it and see the path traced in red so as to spare him/her too much data selection to deal with. And, when the path is selected, users should be able to ask to isolate this part as a seperate figure and draw it to same scale, but represent that slice / segment in a normalized form that is invariant to scale.

To achieve the desired functionality, we need to add a slider to control the tracing of the path in the left pane and provide a button to isolate the selected part as a separate figure in a normalized form. Here's how you can implement this:

Updated HTML Structure
app.component.html:

Updated TypeScript Code
app.component.ts:

Explanation
Slider for Tracing Path:

Added an <input type="range"> element in the HTML to act as a slider.
Added the updateSlider method to handle slider input events and update the sliderValue.
Added the highlightPathBySlider method to highlight the path based on the slider value.
Isolate Segment:

Added the isolateSegment method to normalize the selected segment and display it in the normalized SVG textarea.
Mode Switching:

Added switchToDrawMode, switchToSelectMode, switchToDragMode, and switchToRotateMode methods to switch between different modes.
Event Handling Based on Mode:

Updated the mousedown, mousemove, and mouseup event listeners to handle events based on the current mode.
Highlighting and Resetting Pen Color:

The highlightPath method ensures that the pen color is reset after highlighting the selected path.
Conclusion
By adding a slider to control the tracing of the path in the left pane and providing a button to isolate the selected part as a separate figure in a normalized form, you can now allow users to interact with the SVG path more intuitively. This approach ensures that the canvas responds appropriately to different interactions and allows users to experiment with scale-invariance and visualize the selected path accurately.

=============
### Idea 1 - Scale-Invariance, Rotation-Invariance, Skew-Tolerance
=============
can we view the path in SVG curve as an array and store it in JSONNET. My objective is to make an scale-invariant for a slice taken of the cursive handwriting that remains the same even if it is rotated. So, it is scale-invariabt, rotaion-invariant and skew-tolerant. That is any skew in the path/curve (bezier curve) if very minor should produce almost an exact match to the distribution. 

but scale-invariant does not mean it is invariant to relative scale. for example a zero may actdual look like a dot if the next item is a very big letter "A o" could mean "A." or "A0" depending on relative sizing. How do we get to that array or JSONNET representation. I am ready to do some validations on the initial represtantation of the array each time it is processed out of JSONNET to take care of rotation and relative sizing so that we can get good matches as highlighted in the difference between "A." and "A0". So, we need simple validtions on JSONNET that will support our normaliztion with scale-invariance, rotation-invariance, while they (jsonnet validations) make sure we are matching likes with likes (and not apples with oranges)

To achieve scale-invariance, rotation-invariance, and skew-tolerance for cursive handwriting, we can represent the SVG path as an array of points and store it in JSONNET. JSONNET is a data templating language that can help us manage and validate the data. Here's how you can approach this:

Convert SVG Path to Array:

Convert the SVG path to an array of points.
Normalize the points to achieve scale-invariance and rotation-invariance.
Store in JSONNET:

Store the array of points in JSONNET format.
Add validations to ensure the data meets the required criteria.
Process and Validate:

Process the JSONNET data to apply validations and ensure the data is correctly normalized.
Step-by-Step Implementation
1. Convert SVG Path to Array
TypeScript Code:

2. Store in JSONNET
JSONNET Representation:

{
  "points": [
    { "x": 0.0, "y": 0.0 },
    { "x": 0.5, "y": 0.5 },
    { "x": 1.0, "y": 1.0 }
  ]
}

3. Process and Validate
JSONNET Validation:

local validatePoints(points) = 
  std.assert(
    std.all(points, function(p) p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1),
    "Points must be normalized between 0 and 1"
  );

{
  "points": validatePoints([
    { "x": 0.0, "y": 0.0 },
    { "x": 0.5, "y": 0.5 },
    { "x": 1.0, "y": 1.0 }
  ])
}

Explanation
Convert SVG Path to Array:

The svgPathToArray function converts an SVG path string to an array of points.
The normalizePoints function normalizes the points to achieve scale-invariance and rotation-invariance.
Store in JSONNET:

The JSONNET representation stores the array of points.
The validatePoints function ensures that the points are normalized between 0 and 1.
Process and Validate:

The JSONNET validation ensures that the data meets the required criteria for normalization.
Conclusion
By converting the SVG path to an array of points, normalizing the points, and storing them in JSONNET, you can achieve scale-invariance, rotation-invariance, and skew-tolerance for cursive handwriting. The JSONNET validations ensure that the data is correctly normalized and meets the required criteria. This approach allows you to manage and validate the data effectively, ensuring accurate matching and representation of cursive handwriting.

switchtodrawmode


=============
### 
=============
once i isolate a segment, i should be able to save that slice that is marked in red to a JSON/JSONNET that is temporaritly stored to a table that appears within the HTML. I sould be save this table later to DynamoDB with metadata.

The idea is to select 10 letters of different sizes and after select do space transformations like  drag, rotate, isolate. The slice that is produced for the same sliding selection on each transformed variant is a sample drawn from this image after transformation.

just to make sure we are selecting the equal part the slider in each case should be the same for a particular table save.

for example if i draw A, the select, drag, rotate and isolate segmetn till 45% based on a proportional feature (called slice of interest - SOI), this SOI should be selected to the same sliding level in order to make sure the space transformations will be recognizable by a Deep Learning Algorithm with one of the two approaches which we can determine based on data experimentation.

1. if our normatlization preserves the core essence of the feature which is invariant to scale and drag - two different space transformations, then we have an excellent method to catalog a template for an SOI. And, it becomes the basis for training deep learning model.
2. but if the normalization to JSON/JSONNET or array is not perfect, then we need to still make the deep learning recognize this with more training to become sensitive to the feature through more advanced libraries or more training. 

A semantic rule set in point 1 is ideal, but if this domain based rule becomes difficult due to less than perfect normalization, then we need more generic deep learning (DL) which. So, the design tradeoff is to strike a balance between betwen generic DL (very costly) and more semantic ruleset informed techniue which reduced the burden on DL.

To achieve the desired functionality, we need to implement the following steps:

Isolate and Save Segment:

Allow the user to isolate a segment and save it to a temporary table in the HTML.
Store the segment in JSON/JSONNET format.
Space Transformations:

Implement drag, rotate, and isolate transformations.
Ensure the slider is consistent for selecting the same slice of interest (SOI) across different transformations.
Save to DynamoDB:

Provide functionality to save the table with metadata to DynamoDB.
Step-by-Step Implementation
1. Isolate and Save Segment
HTML Structure:

TypeScript Code:



=============
###
=============