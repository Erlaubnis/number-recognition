let model;
var canvasWidth             = 150;
var canvasHeight            = 150;
var canvasStrokeStyle       = "#ff6868";
var canvasLineJoin          = "round";
var canvasLineWidth         = 10;
var canvasBackgroundColor   = "black";
var canvasId                = "canvas";
var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;
var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");
 
canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}
 
var ctx = canvas.getContext("2d");

$("#canvas").mousedown(function(e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX- rect.left;;
    var mouseY = e.clientY- rect.top;
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
});

canvas.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
 
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];
 
    var mouseX = touch.clientX - rect.left;
    var mouseY = touch.clientY - rect.top;
 
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
 
}, false);
 
$("#canvas").mousemove(function(e) {
    if(drawing) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = e.clientX- rect.left;;
        var mouseY = e.clientY- rect.top;
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
});
 
//---------------------
// TOUCH MOVE function
//---------------------
canvas.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    if(drawing) {
        var rect = canvas.getBoundingClientRect();
        var touch = e.touches[0];
 
        var mouseX = touch.clientX - rect.left;
        var mouseY = touch.clientY - rect.top;
 
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
}, false);

$("#canvas").mouseup(function(e) {
    drawing = false;
});
 
canvas.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

$("#canvas").mouseleave(function(e) {
    drawing = false;
});

canvas.addEventListener("touchleave", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);
 
function addUserGesture(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
}
 
function drawOnCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 
    ctx.strokeStyle = canvasStrokeStyle;
    ctx.lineJoin    = canvasLineJoin;
    ctx.lineWidth   = canvasLineWidth;
 
    for (var i = 0; i < clickX.length; i++) {
        ctx.beginPath();
        ctx.moveTo(clickX[i-1], clickY[i-1]);
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}
 
$("#clear-btn").click(async function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    $(".prediction-text").empty();
    $("#result_box").addClass('d-none');
});

async function loadModel() {
    model = undefined; 
    model = await tf.loadLayersModel("./assets/models/model.json");
}
   
loadModel();

function preprocessCanvas(image) {
   let tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([28, 28])
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat();
    return tensor.div(255.0);
}

$("#predict-btn").click(async function () {
    var imageData = canvas.toDataURL();
    let tensor = preprocessCanvas(canvas);
    let predictions = await model.predict(tensor).data();
    let results = Array.from(predictions);
 
    $("#result_box").removeClass('d-none');
    validate(results);
});

const validate = (data) => {
    let max = data[0];
    let x = 0;
    let result = document.getElementById('result');

    for(var i = 1; i < data.length; i++) {
        if(data[i] > max) {
            x = i;
            max = data[i];
        }
    }
    
    result.style.visibility = 'visible';
    result.innerHTML = `The Number is ${x} to ${Math.round(max*10000)/100}%`
}