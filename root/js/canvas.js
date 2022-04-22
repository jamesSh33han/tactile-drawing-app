// InTact Sketchpad Drawing Application using HTML, JavaScript, and CSS
// JJ, Owen, Hanah, Ran
// Created November 3rd, 2021

// Using Canvas API
let canvas;
let ctx;
let savedImageData;

// Stores whether I'm currently dragging the mouse
let dragging = false;
let strokeColor = 'black';
let fillColor = 'black';
// Set initial line width to 2
let line_Width = 6;
let polygonSides = 6;
// Tool currently using
let currentTool = 'brush';
let canvasWidth = 1625;
let canvasHeight = 940;

// Stores whether I'm currently using brush
let usingBrush = false;
// Stores line x & ys used to make brush lines
let brushXPoints = new Array();
let brushYPoints = new Array();
// Stores whether mouse is down
let brushDownPos = new Array();

// Stores size data used to create rubber band shapes
// that will redraw as the user moves the mouse
class ShapeBoundingBox{
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}

// Holds x & y position where clicked
class MouseDownPos{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}

// Holds x & y location of the mouse
class Location{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}

// Holds x & y polygon point values
class PolygonPoint{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
// Stores top left x & y and size of rubber band box 
let shapeBoundingBox = new ShapeBoundingBox(0,0,0,0);
// Holds x & y position where clicked
let mousedown = new MouseDownPos(0,0);
// Holds x & y location of the mouse
let loc = new Location(0,0);

// Call for our function to execute when page is loaded
document.addEventListener('DOMContentLoaded', setupCanvas);

function setupCanvas(){
    // Get reference to canvas element
    canvas = document.getElementById('my-canvas');
    // Get methods for manipulating the canvas
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = line_Width;
    // Execute ReactToMouseDown when the mouse is clicked
    canvas.addEventListener("mousedown", ReactToMouseDown);
    // Execute ReactToMouseMove when the mouse is clicked
    canvas.addEventListener("mousemove", ReactToMouseMove);
    // Execute ReactToMouseUp when the mouse is clicked
    canvas.addEventListener("mouseup", ReactToMouseUp);
}

// Returns mouse x & y position based on canvas position in page
function GetMousePosition(x,y){
    // Get canvas size and position in web page
    let canvasSizeData = canvas.getBoundingClientRect();
    return { x: (x - canvasSizeData.left) * (canvas.width  / canvasSizeData.width),
        y: (y - canvasSizeData.top)  * (canvas.height / canvasSizeData.height)
      };
}
 
function SaveCanvasImage(){
    // Save image
    savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
}
 
function RedrawCanvasImage(){
    // Restore image
    ctx.putImageData(savedImageData,0,0);
}

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

function drawRubberbandShape(loc){
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    if(currentTool === "brush"){
        // Create paint brush
        DrawBrush();
    } else if(currentTool === "eraser"){
        // Create paint brush
        EraserBrush();
    }
}

function UpdateRubberbandOnMove(loc){
    // Stores changing height, width, x & y position of most 
    // top left point being either the click or mouse location
    UpdateRubberbandSizeData(loc);
 
    // Redraw the shape
    drawRubberbandShape(loc);
}
 
// Store each point as the mouse moves and whether the mouse
// button is currently being dragged
function AddBrushPoint(x, y, mouseDown){
    brushXPoints.push(x);
    brushYPoints.push(y);
    // Store true that mouse is down
    brushDownPos.push(mouseDown);
}
 
// Cycle through all brush points and connect them with lines
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

// Cycle through all eraser points and connect them with lines
function EraserBrush(){
    let currentTool = 'eraser';
    let strokeColor = 'white';
    let fillColor = 'white';
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

    // Brush will store points in an array
    if(currentTool === 'brush'){
        usingBrush = true;
        AddBrushPoint(loc.x, loc.y);
    } 
    
    // Eraser will also store points in an array
    else if (currentTool === "eraser") {
        // Create eraser brush
        usingBrush = true;
        AddBrushPoint(loc.x, loc.y);
    }
}
 
function ReactToMouseMove(e){
    canvas.style.cursor = "crosshair";
    loc = GetMousePosition(e.clientX, e.clientY);

    // If using brush tool and dragging store each point
    if(currentTool === 'brush' && dragging && usingBrush){
        // Throw away brush drawings that occur outside of the canvas
        if(loc.x > 0 && loc.x < canvasWidth && loc.y > 0 && loc.y < canvasHeight){
            AddBrushPoint(loc.x, loc.y, true);
        }
        RedrawCanvasImage();
        DrawBrush();
    } else if(currentTool === 'eraser' && dragging && usingBrush){
        // Throw away brush drawings that occur outside of the canvas
        if(loc.x > 0 && loc.x < canvasWidth && loc.y > 0 && loc.y < canvasHeight){
            AddBrushPoint(loc.x, loc.y, true);
        }
        RedrawCanvasImage();
        EraserBrush();
    } else {
        if(dragging){
            RedrawCanvasImage();
            UpdateRubberbandOnMove(loc);
        }
    }
};
 
function ReactToMouseUp(e){
    canvas.style.cursor = "default";
    loc = GetMousePosition(e.clientX, e.clientY);
    RedrawCanvasImage();
    UpdateRubberbandOnMove(loc);
    dragging = false;
    usingBrush = false;
}

// Defining labels to represent line thickness and the current index value
var labels = [ "Thick", "Medium", "Thin"];
var index = 0;
// Defining function changeThickness: when clicked will toggle between three predefined line thicknesses (Initial, Thin, Thick)
// Utilizes artyom to verbally alert the user to which slider option they have currently selected
// ----- BUG: currently when changing to a thicker line thickness every line on the canvas gets updated -----
function changeThickness() {
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

// Function to allow us to complete mirror transformations using the current canvas image
// Can mirror an image horizontally, vertically, or both
// this function is called in both the flipVertically() & flipHorizontally()
function mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false){
    ctx.save();  // save the current canvas state
    ctx.setTransform(
        horizontal ? -1 : 1, 0, // set the direction of x axis
        0, vertical ? -1 : 1,   // set the direction of y axis
        x + (horizontal ? image.width : 0), // set the x origin
        y + (vertical ? image.height : 0)   // set the y origin
    );
    ctx.drawImage(image,0,0);
    ctx.restore(); // restore the state as it was when this function was called
}

// Function to mirror canvas drawing over the vertical axis
function flipVertically() {
    let canvasImage = document.getElementById("my-canvas");
    // call mirrorImage() function above to transform canvas
    mirrorImage(ctx, canvasImage, 0, 0, false, true); // vertical mirror
    // using artyom to speak aloud
    artyom.say("Mirroring Vertically");
}

// Function to mirror canvas drawing over the horizontal axis
function flipHorizontally() {
    let canvasImage = document.getElementById("my-canvas");
    // call mirrorImage() function above to transform canvas
    mirrorImage(ctx, canvasImage, 0, 0, true, false); // horizontal mirror
    // using artyom to speak aloud
    artyom.say("Mirroring Horizontally");
}

// Function to clear the entire canvas element when called, verbally alerts the user to change in drawing
function DeleteImage() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); //clear html5 canvas
    document.location.reload();
    // using artyom to speak aloud
    artyom.say("Deleting Image");
}

// Function to download the current canvas object as a png image
function downloadCanvasAsImage(){
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
    artyom.say("Downloading Image");
}

// ------- **** NEEDS TO BE FIXED **** --------
// Function to convert canvas image to SVG and output the result to the user
// Utilizes svgcanvas.js & the creation of a new SVGCanvas()
function canvasToSVG() {
    let canvasImage = document.getElementById("my-canvas");
    ctx.save();
    ctx = new SVGCanvas("my-canvas");
    ctx.drawImage(canvasImage);
    canvasSVG = ctx.toDataURL("image/svg+xml");
}

// Function to translate canvas image to a user-specified point
// ------- **** NEEDS TO BE FIXED **** --------
// 1. when the function is called to translate the drawn image it does not translate 
// exactly to the users input coordinates, rather a point close to the expected translation
// - issue resides in the xPos and yPos calculation from the HTML body and canvas element
function translateImage() {
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

// Function to act as a key listener
// Will constantly keep track of the value associated with the most recent character key that was pressed
document.onkeydown = function (e) {
    let keyCode = e.keyCode;
    let chrCode = keyCode - 48 * Math.floor(keyCode / 48);
    // chr will constantly be updated to reflect the most recent key pressed
    let chr = String.fromCharCode((96 <= keyCode) ? chrCode: keyCode);

    // if statements to reflect different wacom button key assignments
    if (chr == 'F') {
        // if the F key is pressed (mapped to the bottom Wacom button) save and 
        // download the current canvas image
        downloadCanvasAsImage();
    }
    else if (chr == 'G') {
        // if the G key is pressed (mapped to the 2nd from bottom Wacom button)
        // delete the current canvas image
        DeleteImage();
    }
    else if (chr == 'H') {
        // if the H key is pressed (mapped to the 3rd from bottom Wacom button)
        // toggle the line thickness from Thick to Medium to Thin
        changeThickness();
    }
    else if (chr == 'J') {
        // if the J key is pressed (mapped to the 4th from bottom Wacom button)
        // Mirror the current image over the Vertical axis
        flipVertically();
    }
    else if (chr == 'K') {
        // if the K key is pressed (mapped to the 5th from bottom Wacom button)
        // Mirror the current image over the Horizontal axis
        flipHorizontally();
    }
    else if (chr == 'L') {
        // if the L key is pressed (mapped to the 6th from bottom Wacom button)
        // Translate the current image to the user-specified point
        translateImage();
    }

};