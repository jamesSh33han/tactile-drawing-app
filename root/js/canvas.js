/**
 * inTACT Digital Sketchpad Application
 * A joint collaboration between E.A.S.Y LLC & the UVM SEED Program
 * 
 * This Application was developed to be used in conjunction with the inTACT Tactile Sketchpad created by E.A.S.Y. LLC and Wacom 
 * Digitizing Technology. The application allows a tactile image that was drawn on the sketchpad surface to be digitally recorded. 
 * The user can manipulate the digital image through included editing commands such as toggling line thickness, mirroring the image, 
 * or translating the image. The digital image can be saved and downloaded to the users personal computer, where it can then be shared 
 * via the internet or sent to the inTACT Printer, which is able to print the digital image in the original tactile format.
 * 
 * @link https://github.com/jamesSh33han/tactile-drawing-app
 * @link https://www.easytactilegraphics.com/
 * @author James Sheehan
 * @since 9.22.21
 */

// Initialize Canvas & File system access API
let canvas;
let ctx;
let savedImageData;
let fileHandle;

// Initialize drawing variables
let dragging = false; // Stores current mouse drawing state
let strokeColor = 'black'; // line color
let fillColor = 'black'; // fill color
let line_Width = 6; // Set initial line width to 6
let currentTool = 'brush'; // Define Tool we are urrently using
let canvasWidth = 1625; // canvas width
let canvasHeight = 940; // canvas height

let usingBrush = false; // Stores whether I'm currently using brush
let brushXPoints = new Array(); // Stores line x points after 'mousedown' event
let brushYPoints = new Array(); // Stores line y points after 'mousedown' event
let brushDownPos = new Array(); // Stores whether mouse is down or not

var labels = [ "Thick", "Medium", "Thin"]; // line thickness options
var index = 0; // Initialize an index value
let restore_array = []; // Array to hold most recently drawn line path for undo
let ind = -1; // Initialize an index value for undo function

/**
 * Simulate rubber band effect when drawing shapes. Allows you to move image placement before 
 * the mouse click is released
 * @access private
 */
class ShapeBoundingBox{
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}

/**
 * holds the x & y location of the mouse as it is clicked down
 * @access private
 */
class MouseDownPos{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}

/**
 * Holds the x & y location of the mouse
 * @access private
 */
class Location{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}

/**
 * Holds the x & y polygon point values for shapes we create
 * @access private
 */
class PolygonPoint{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}

let shapeBoundingBox = new ShapeBoundingBox(0,0,0,0); // Holds shape bounding box coordinates
let mousedown = new MouseDownPos(0,0); // Holds x & y position of where the mouse was clicked
let loc = new Location(0,0); // Holds x & y location of the mouse as it moves around the screen
document.addEventListener('DOMContentLoaded', setupCanvas); // Call for our function to execute when webpage is loaded

/**
 * setupCanvas()
 * 
 * creates reference variables for the canvas element and methods to manipulate the canvas,
 * creates listeners to handle mouse events that allow the user to draw on the canvas with the cursor
 * @since 1.0.0
 * 
 * @param {"mousedown"} ReactToMouseDown Executes when the mouse is clicked down (starts drawing)
 * @param {"mousemove"} ReactToMouseMove Executes when the mouse is moved (after "mousedown" executes, mouse is continually drawing)
 * @param {"mouseup"} ReactToMouseUp Execute when the mouse is lifted up (stops drawing)
 */
function setupCanvas(){
    // Get reference to canvas element
    canvas = document.getElementById('my-canvas');
    // Get methods for manipulating the canvas
    ctx = canvas.getContext('2d');
    // Set strokeStyle and lineWidth to defaults, create a default white canvas background
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = line_Width;
    // Add listeners to handle mouse events (mouse clicked, mouse move, mouse released)
    canvas.addEventListener("mousedown", ReactToMouseDown);
    canvas.addEventListener("mousemove", ReactToMouseMove);
    canvas.addEventListener("mouseup", ReactToMouseUp);
}

// Function to keep track of the current tool selected
function ChangeTool(toolClicked) {
    document.getElementById("imageInput").className = "menu__item";
    document.getElementById("save").className = "menu__item";
    document.getElementById("brush").className = "menu__item";
    document.getElementById("undo").className = "menu__item";
    document.getElementById("delete").className = "menu__item";
    document.getElementById("changeThickness").className = "menu__item";
    document.getElementById("verticalTransform").className = "menu__item";
    document.getElementById("horizontalTransform").className = "menu__item";
    document.getElementById("translate").className = "menu__item";
    document.getElementById(toolClicked).className = "menu__item menu__item--active";
    currentTool = toolClicked;
}

/**
 * GetMousePosition(x,y)
 * 
 * Returns mouse x & y position on the canvas based on the canvas position in the webpage
 * @since 1.0.0
 * 
 * @param {int} x mouse x-coordinate in the canvas
 * @param {int} y mouse y-coordinate in the canvas
 */
function GetMousePosition(x,y){
    // Get canvas size and position in web page
    let canvasSizeData = canvas.getBoundingClientRect();
    return { x: (x - canvasSizeData.left) * (canvas.width  / canvasSizeData.width),
        y: (y - canvasSizeData.top)  * (canvas.height / canvasSizeData.height)
      };
}
 
// Save canvas Image data
function SaveCanvasImage(){
    // Save image
    savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
}
 
// Redraw saved Image data onto the canvas
function RedrawCanvasImage(){
    // Restore image
    ctx.putImageData(savedImageData,0,0);
}

// Update size of rubberband from current mouse position
function UpdateRubberbandSizeData(loc){
    // Height & width are the difference between were clicked
    // and current mouse position
    shapeBoundingBox.width = Math.abs(loc.x - mousedown.x);
    shapeBoundingBox.height = Math.abs(loc.y - mousedown.y);
 
    // If mouse is below where mouse was clicked originally
    if(loc.x > mousedown.x){
 
        // Store mousedown because it is farthest left
        shapeBoundingBox.left = mousedown.x;
    } else {
 
        // Store mouse location because it is most left
        shapeBoundingBox.left = loc.x;
    }
 
    // If mouse location is below where clicked originally
    if(loc.y > mousedown.y){
 
        // Store mousedown because it is closer to the top
        // of the canvas
        shapeBoundingBox.top = mousedown.y;
    } else {
 
        // Otherwise store mouse position
        shapeBoundingBox.top = loc.y;
    }
}

// Draw rubberband shape *** I think I can delete this function
function drawRubberbandShape(loc){
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    if(currentTool === "brush"){
        // Create paint brush
        DrawBrush();
    }
}

// Update rubberband on move
function UpdateRubberbandOnMove(loc){
    // Stores changing height, width, x & y position of most 
    // top left point being either the click or mouse location
    UpdateRubberbandSizeData(loc);
 
    // Redraw the shape
    drawRubberbandShape(loc);
}
 
/**
 * AddBrushPoint(x,y, mouseDown)
 * 
 * Adds x & y coordinate data for each point as the mouse moves in the brushXPoints[] & brushYPoints[] arrays
 * Stores a true value that the mouse is currently down in the brushDownPos[] array
 * @since 1.0.0
 * 
 * @param {int} x mouse x-coordinate in the canvas
 * @param {int} y mouse y-coordinate in the canvas
 * @param {boolean} mouseDown represents if the mouse is currently down or not
 */
function AddBrushPoint(x, y, mouseDown){
    brushXPoints.push(x);
    brushYPoints.push(y);
    // Store true that mouse is down
    brushDownPos.push(mouseDown);
}
 
/**
 * DrawBrush()
 * 
 * For each value in the brushXPoints[] array, check the corresponding index of brushDownPos[]
 * If there exists a value at that index of brushDownPos[], the mouse button was down at that point, and we move from the
 * point represented by ctx.beginPath() to the point stored in brushXPoints[] & brushYPoints[] at that index.
 * @since 1.0.0
 */
function DrawBrush(){
    for(let i = 1; i < brushXPoints.length; i++){
        ctx.beginPath();
 
        // Check if the mouse button was down at this point
        // and if so continue drawing
        if(brushDownPos[i]){
            ctx.moveTo(brushXPoints[i-1], brushYPoints[i-1]);
        } else {
            ctx.moveTo(brushXPoints[i]-1, brushYPoints[i]);
        }
        ctx.lineTo(brushXPoints[i], brushYPoints[i]);
        ctx.closePath();
        ctx.stroke();
    }
}
 
/**
 * ReactToMouseDown(e)
 * 
 * Retrieves the mouse x & y position when clicked and stores when the mouse is being held down
 * If the current tool is set to brush and the mouse is being held down, stores the x & y position in an array
 * @since 1.0.0
 * 
 * @param {event} e GetMousePosition() event, retreives the mouse x & y position
 */
function ReactToMouseDown(e){
    // Change the mouse pointer to a crosshair
    canvas.style.cursor = "crosshair";
    // Store location 
    loc = GetMousePosition(e.clientX, e.clientY);
    // Save the current canvas image
    SaveCanvasImage();
    // Store mouse position when clicked
    mousedown.x = loc.x;
    mousedown.y = loc.y;
    // Store that yes the mouse is being held down
    dragging = true;

    // Both brushes will store points in an array
    if(currentTool === 'brush'){
        usingBrush = true;
        AddBrushPoint(loc.x, loc.y);
    }
}

/**
 * ReactToMouseMove(e)
 * 
 * If the brush tool is selected and the mouse event for dragging is true, store each x & y coordinate point location
 * of the mouse as it moves. Any time the mouse moves outside of the canvas, the brush drawings are discarded before the canvas is redrawn
 * @since 1.0.0
 */
function ReactToMouseMove(e){
    canvas.style.cursor = "crosshair";
    loc = GetMousePosition(e.clientX, e.clientY);

    // If using either brush tool and dragging the mouse store each point
    if((currentTool === 'brush') && dragging && usingBrush){
        // Throw away brush drawings that occur outside of the canvas
        if(loc.x > 0 && loc.x < canvasWidth && loc.y > 0 && loc.y < canvasHeight){
            AddBrushPoint(loc.x, loc.y, true);
        }
        RedrawCanvasImage();
        DrawBrush();
    } else {
        if(dragging){
            RedrawCanvasImage();
            UpdateRubberbandOnMove(loc);
        }
    }
};

/**
 * ReactToMouseUp(e)
 * 
 * Enables the brush to stop drawing when the mouse is no longer being pressed down. 
 * @since 1.0.0
 * 
 * @param {boolean} dragging is true when the mouse is pressed and held down. Is false when the mouse is lifted back up
 * @param {boolean} usingBrush is true when the user is actively drawing on the canvas
 */
function ReactToMouseUp(e){
    canvas.style.cursor = "default";
    loc = GetMousePosition(e.clientX, e.clientY);
    RedrawCanvasImage();
    UpdateRubberbandOnMove(loc);
    dragging = false;
    usingBrush = false;

    restore_array.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ind += 1;
    
}

/**
 * ChangeThickness()
 * 
 * when clicked will toggle between three predefined line thicknesses (Initial, Thin, Thick)
 * @since 1.0.0
 * 
 * @param {ctx.lineWidth} Thick Sets line thickness = 6
 * @param {ctx.lineWidth} Medium Sets line thickness = 2
 * @param {ctx.lineWidth} Thin Sets line thickness = 0.5
 * 
 * ------- **** BUG **** --------
 * when toggling from the "Thin" line back to the "Thick" line, every line that has been previously drawn on the canvas also gets toggled
 */
function ChangeThickness() {
    index++;
    if (index == labels.length) {
        index = 0;
    }
    if (labels[index] == "Thick") {
        artyom.say("Setting Thickness to Thick");
        ctx.lineWidth = 6;
    }
    if (labels[index] == "Medium") {
        ctx.beginPath();
        artyom.say("Setting Thickness to Medium");
        ctx.lineWidth = 2;
    }
    if (labels[index] == "Thin") {
        artyom.say("Setting Thickness to Thin");
        ctx.lineWidth = 0.5;
    }
}

/**
 * mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false)
 * 
 * Function to allow us to complete mirror transformations using the current canvas image. 
 * Can mirror a stored canvas image horizontally, vertically, or both. Returns the canvas to its original state
 * with both the original & translated drawings.
 * @since 1.0.0
 * 
 * @param {canvas.getContext('2d')} ctx retrieve state of drawing methods from original drawing before translation
 * @param {canvas} image canvas object that contains the original drawing before transformation
 * @param {int} x coordinate of the x origin
 * @param {int} y coordinate of the y origin
 * @param {boolean} horizontal sets the direction of the x axis
 * @param {boolean} vertical sets the direction of the y axis
 */
function mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false){
    ctx.save();  // save the current canvas state
    ctx.setTransform(
        horizontal ? -1 : 1, 0,
        0, vertical ? -1 : 1,
        x + (horizontal ? image.width : 0),
        y + (vertical ? image.height : 0)
    );
    ctx.drawImage(image,0,0);
    ctx.restore(); // restore the state as it was when this function was called
}

/**
 * FlipVertically()
 * 
 * Mirrors the current canvas drawing over the vertical axis of the webpage using mirrorImage()
 * @since 1.0.0
 * 
 * @param {Canvas} canvasImage A new canvas object to store the original drawing before translation
 */
function FlipVertically() {
    let canvasImage = document.getElementById("my-canvas");
    // call mirrorImage() function above to transform canvas
    mirrorImage(ctx, canvasImage, 0, 0, false, true); // vertical mirror
    // using artyom to speak aloud
    artyom.say("Mirroring Vertically");
}

/**
 * FlipHorizontally()
 * 
 * Mirrors the current canvas drawing over the horizontal axis of the webpage using mirrorImage()
 * @since 1.0.0
 * 
 * @param {Canvas} canvasImage A new canvas object to store the original drawing before translation
 */
function FlipHorizontally() {
    let canvasImage = document.getElementById("my-canvas");
    // call mirrorImage() function above to transform canvas
    mirrorImage(ctx, canvasImage, 0, 0, true, false); // horizontal mirror
    // using artyom to speak aloud
    artyom.say("Mirroring Horizontally");
}

/**
 * ReadImage()
 * 
 * Reads a File provided by the user, then converts it to a data URL, and uses that data URL to display the image in an img element.
 * This img element is then put onto the canvas using ctx.drawImage().
 * @since 1.0.0
 * 
 * @param {Blob} file file object extracted from the file that was selected using the file picker in GetFile().
 */
function ReadImage(file) {
    let img = document.createElement("img");
    // Check if the file is an image.
    if (file.type && !file.type.startsWith('image/')) {
      console.log('File is not an image.', file.type, file);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      img.src = event.target.result;
    });
    reader.readAsDataURL(file);
    
    img.addEventListener("load", () => {
        for (let x = 10; x < 40; x += 30) {
            ctx.drawImage(img, x, 10);
        }
    });
}

/**
 * GetFile()
 * 
 * Utilizes the file system access API, opens the file picker and prompts the user to select an image file that they would like
 * to be uploaded into the canvas. Calls ReadImage() on the selected file object to extract the image data and put it on the canvas.
 * @since 1.0.0
 */
async function GetFile() {
    [fileHandle] = await window.showOpenFilePicker();
    // returning a file object, which contains a blob
    const file = await fileHandle.getFile();
    // reading image data from file object
    ReadImage(file);
}

/**
 * Undo()
 * 
 * When selected, removes the last line that was drawn on the canvas
 * @since 1.0.0
 */
function Undo() {
    if ( ind <= 0 ) {
        Delete();
    } else {
        ind -= 1;
        restore_array.pop();
        RedrawCanvasImage();
        ctx.putImageData(restore_array[ind], 0, 0);
        brushXPoints = new Array(); // Stores line x points after 'mousedown' event
        brushYPoints = new Array(); // Stores line y points after 'mousedown' event
        brushDownPos = new Array(); // Stores whether mouse is down or not
        artyom.say("Undo");
    }
}

/**
 * Delete()
 * 
 * Function to clear the entire canvas element when called, verbally alerts the user to change in drawing
 * @since 1.0.0
 */
function Delete() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear html5 canvas
    document.location.reload();
    // using artyom to speak aloud
    artyom.say("Deleting Image");
    restore_array = [];
    ind = -1;
}

/**
 * DownloadPNG()
 * 
 * Downloads the current canvas object as a .PNG image in the users "downloads" directory
 * @since 1.0.0
 * 
 * @return {XMLHttpRequest} A .PNG file that contains the current canvas image
 */
function DownloadPNG() {
    let canvasImage = document.getElementById("my-canvas").toDataURL('image/png');
    // this can be used to download any image from webpage to local disk
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = 'drawing.png';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
    xhr.open('GET', canvasImage); // This is to download the canvas Image
    xhr.send();
    artyom.say("Downloading PNG Image");
}

/**
 * DownloadJPEG()
 * 
 * Downloads the current canvas object as a .JPEG image in the users "downloads" directory
 * @since 1.0.0
 * 
 * @return {XMLHttpRequest} A .PNG file that contains the current canvas image
 */
 function DownloadJPEG() {
    SaveCanvasImage();
    ctx.fillStyle = '#fff';  /// set white fill style
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let canvasImage = document.getElementById("my-canvas").toDataURL('image/jpeg');
    // this can be used to download any image from webpage to local disk
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = 'drawing.jpeg';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
    xhr.open('GET', canvasImage); // This is to download the canvas Image
    xhr.send();
    artyom.say("Downloading JPEG Image");
    RedrawCanvasImage();
}

/**
 * TranslateImage()
 * 
 * Function to translate canvas image to a user-specified point using an event listener
 * @since 1.0.0
 * 
 * ------- **** BUG **** --------
 * when the function is called to translate the drawn image it does not translate exactly to the users input coordinates, 
 * but a point close to the expected translation
 */
function TranslateImage() {
    let translateCanvas = document.getElementById("my-canvas");
    let context = translateCanvas.getContext('2d');

    // function to execute on mouse click
    const clicked = (e) => {
        context.save();
        translateCanvas.disabled=true; // this line is disabling the canvas from being clicked again
        let rect = translateCanvas.getBoundingClientRect();
        let xPos = e.clientX - rect.left;
        let yPos = e.clientY - rect.top;
        context.translate(xPos, yPos);
        context.drawImage(translateCanvas,0,0);
        context.restore(); // restore the state as it was when this function was called

        translateCanvas.removeEventListener('click', clicked) //  this line removes the event listener right after clicking the canvas
    }

    translateCanvas.addEventListener('click', clicked)
    context.restore(); // restore the state as it was when this function was called
    artyom.say("Translating Image");
}

/**
 * Function to handle key press events. Will constantly keep track of the value associated with the most 
 * recent character key that was pressed. 
 * @since 1.0.0
 * 
 * The following characters are each mapped to a tactile button on the inTACT Sketchpad:
 * S: if the S key is pressed we download the current canvas image as a .PNG
 * D: if the D key is pressed we download the current canvas image as a .JPEG
 * F: if the F key is pressed we undo the last line drawn on the canvas
 * G: if the G key is pressed delete the entire canvas image
 * H: if the H key is pressed toggle the line thickness from Thick to Medium to Thin
 * J: if the J key is pressed mirror the current image over the Vertical axis
 * K: if the K key is pressed mirror the current image over the Horizontal axis
 * L: if the L key is pressed translate the current image to the user-specified point
 */
document.onkeydown = function (e) {
    let keyCode = e.keyCode;
    let chrCode = keyCode - 48 * Math.floor(keyCode / 48);
    // chr will constantly be updated to reflect the most recent key pressed
    let chr = String.fromCharCode((96 <= keyCode) ? chrCode: keyCode);

    // If statements to reflect different wacom button key assignments
    if (chr == 'S') {
        DownloadPNG();
    }
    else if (chr == 'D') {
        DownloadJPEG();
    }
    else if (chr == 'F') {
        Undo();
    }
    else if (chr == 'G') {
        Delete();
    }
    else if (chr == 'H') {
        ChangeThickness();
    }
    else if (chr == 'J') {
        FlipVertically();
    }
    else if (chr == 'K') {
        FlipHorizontally();
    }
    else if (chr == 'L') {
        TranslateImage()
    }
};