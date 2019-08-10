var canvas = document.getElementById("data");
var draw = canvas.getContext("2d");
var maxWidth = canvas.offsetWidth;
var maxHeight = canvas.offsetHeight;
var column = canvas.offsetWidth / 3;
var halfColumn = column / 2;

// setting canvas width and height manually is necessary
// for fixing the blurry line issue.
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

draw.fillStyle = "rgb(150, 160, 200)";
draw.strokeStyle = "rgb(150, 160, 200)";

draw.beginPath();
// 10 is subtracted to ensure the curve meets the screen edge.
draw.moveTo(-10, 0);
draw.arcTo(halfColumn, 40, column, 40, maxWidth * 2);
draw.lineTo(halfColumn * 3, 40);
draw.lineTo(halfColumn * 3, maxHeight);
draw.lineTo(0, maxHeight);
draw.lineTo(0, 0);

draw.fill();
draw.stroke();
draw.closePath();

draw.beginPath();
// 10 is added to ensure the curve meets the screen edge.
draw.moveTo(maxWidth + 10, 0);
draw.arcTo(halfColumn * 5, 40, column * 2, 40, maxWidth * 2);
draw.lineTo(halfColumn * 3, 40);
draw.lineTo(halfColumn * 3, maxHeight);
draw.lineTo(maxWidth, maxHeight);
draw.lineTo(maxWidth, 0);

draw.fill();
draw.stroke();
draw.closePath();

draw.lineWidth = 3;
