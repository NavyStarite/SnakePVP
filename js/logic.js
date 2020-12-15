var canvas = document.getElementById("gameBoard");
var ctx = canvas.getContext("2d");


var rect1 = {x: 5, y: 5, width: 50, height: 50};
var rect2 = {x: 20, y: 10, width: 50, height: 50};

ctx.fillStyle = "#eb4034";
ctx.fillRect(rect1.x,rect1.y,rect1.width,rect1.height);
ctx.fillStyle = "#1f2bd1";
ctx.fillRect(rect2.x,rect2.y,rect2.width,rect2.height);
function update () {
    myMainLoop = window.requestAnimationFrame( update ); 
}
function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    oneSquare();
    
}
function oneSquare(color){
    ctx.fillStyle = color;
    ctx.fillRect(rect2.x,rect2.y,rect2.width,rect2.height);
}
function snek(){

}