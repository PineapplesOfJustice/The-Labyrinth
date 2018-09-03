
/////////////////////////*

// when dealing with continuous numbers, the computer may actually add incorrectly. Thus, it is best ot round the number often to negate those mistakes.

// (Alt + 1) make everything look nicer

////////////////////////*/

var namespace = "http://www.w3.org/2000/svg";

var maze = {
	data: [],
	path: {
	  color: "rgb(193, 154, 107)",
	  grayScale: "rgb(158.898, 158.898, 158.898)",
  },
	wall: {
	  color: "rgb(89, 38, 11)",
	  grayScale: "rgb(46.893, 46.893, 46.893)",
		width: 3,
		outerWall: 1,
  },
	creationSpeed: "requestAnimationFrame",
}
maze.path.grayScale = colorToGrayScale(maze.path.color);
maze.wall.grayScale = colorToGrayScale(maze.wall.color);

var entrance = {player1: {mainWall: [], path: [], collidableObject: "", specialWall: "bottom",}, player2: {mainWall: [], path: [], collidableObject: "", specialWall: "bottom",}, minotaur: {mainWall: [], path: [], collidableObject: "", specialWall: "top",},}

var gridX =  49;
var gridY =  23;
var gridSize =  20;
var gridTotal = (gridX-(maze.wall.outerWall*2))*(gridY-(maze.wall.outerWall*2));
document.getElementById("canvas").setAttribute("viewBox", "0 0 " + (gridX*gridSize) + " " + (gridY*gridSize));

var visited = 1;
var currentCell = [];
var path = [];

var gameMode = "escape";
var amountOfPlayer = 1;
var minotaurPlayer = "computer";

var amountOfMinotaur = 1;
var survivalTime = {minute: 5, second: 0,};
var timer = "";
var timerId = "";

var heroSpeed = 2.0;
var minotaurSpeed = 4.0;
var gameStatus = "inactive";

/*
var player1 = [];
var player2 = [];
var player1Length = 4;
var player2Length = 4;

var direction1X = 1;
var direction1Y = 0;
var direction2X = 1;
var direction2Y = 0;

var player1X = 0;
var player1Y = gridY-1;
var player2X = gridX-1;
var player2Y = 0;
*/

var player = [ {data: "", location: {x: 0, y: 0, unitX: 0, unitY: 0,}, kinematic: {direction: {current: "none", expected: "none"}, moveX: 0, moveY: 0, speed: heroSpeed,}, tag: "hero", death: false,},
             {data: "", location: {x: 0, y: 0, unitX: 0, unitY: 0,}, kinematic: {direction: {current: "none", expected: "none"}, moveX: 0, moveY: 0, speed: heroSpeed,}, tag: "hero", death: false,}, ];

var minotaur = [ {data: "", location: {x: 0, y: 0, unitX: 0, unitY: 0,}, kinematic: {direction: {current: "none", expected: "none"}, moveX: 0, moveY: 0,}, trackCoolDown: {current: 0, add: 3,}, speed: {inactive: 1, active: 2.5, offensive: 4,}, targetLock: "inactive", stunTime: {current: 0, add: 20,}, path: [], kill: false,},];
minotaur = [];

//targetLock = false, true, attack; used to determine minotaur speed: 1.0, 2.5, 4.0

var motionUnit = { top: {moveX: 0, moveY: -1, direction: "top", opposite: "bottom",}, left: {moveX: -1, moveY: 0, direction: "left", opposite: "right",}, bottom: {moveX: 0, moveY: 1, direction: "bottom", opposite: "top",}, right: {moveX: 1, moveY: 0, direction: "right", opposite: "left",}, none: {moveX: 0, moveY: 0, direction: "none", opposite: "none",}, }

var versus = { player1: 1, player2: 0, }

var assist = { status: false, coolDown: {current: 0, add: 7,} };


//Intial Opening Sequence

function colorToGrayScale(color){
  var gray = color.replace("rgb(", "").replace(")", "").replace(/,/g, "").split(" ");
  gray = (Number(gray[0])*0.2126)+(Number(gray[1])*0.7152)+(Number(gray[2])*0.0722);
	gray = Math.round(gray*1000)/1000;
  console.log(gray);
  var grayScale = "rgb(" + gray + ", " + gray + ", " + gray + ")";
	return grayScale;
}

drawGrid();
function drawGrid(){
  for(var y=0; y<gridY; y++){
	maze.data[y] = new Array;
	for(var x=0; x<gridX; x++){
	  maze.data[y][x] = new Object;
	  maze.data[y][x].data = makeRect((x*gridSize), (y*gridSize), gridSize, gridSize, maze.wall.grayScale, 0);
	  maze.data[y][x].visited = false;
	  maze.data[y][x].specialStatus = "none";
	  maze.data[y][x].wall = {left: true, top: true, right: true, bottom: true,}
	  maze.data[y][x].data.setAttribute("stroke-width", maze.wall.width);
	  maze.data[y][x].data.setAttribute("stroke-linecap", "square");
	  maze.data[y][x].data.setAttribute("stroke", maze.wall.grayScale);
	}
  }

  for(var y=0; y<maze.wall.outerWall; y++){
	for(var x=0; x<gridX; x++){
	  maze.data[y][x].specialStatus = "obstacle";
	  maze.data[y][x].data.remove();
	  maze.data[y][x].data = makeRect((x*gridSize), (y*gridSize), gridSize, gridSize, maze.wall.grayScale, 1);
	  maze.data[y][x].data.setAttribute("stroke-width", maze.wall.width/5);
	  maze.data[y][x].data.setAttribute("stroke-linecap", "square");
	  maze.data[y][x].data.setAttribute("stroke", "black");
	}
  }

  for(var y=(gridY-1); y>(gridY-1-maze.wall.outerWall); y--){
	for(var x=0; x<gridX; x++){
	  maze.data[y][x].specialStatus = "obstacle";
  	  maze.data[y][x].data.remove();
	  maze.data[y][x].data = makeRect((x*gridSize), (y*gridSize), gridSize, gridSize, maze.wall.grayScale, 1);
	  maze.data[y][x].data.setAttribute("stroke-width", maze.wall.width/5);
	  maze.data[y][x].data.setAttribute("stroke-linecap", "square");
	  maze.data[y][x].data.setAttribute("stroke", "black");
	}
  }

  for(y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
    for(var x=0; x<maze.wall.outerWall; x++){
	  maze.data[y][x].specialStatus = "obstacle";
	  maze.data[y][x].data.remove();
	  maze.data[y][x].data = makeRect((x*gridSize), (y*gridSize), gridSize, gridSize, maze.wall.grayScale, 1);
	  maze.data[y][x].data.setAttribute("stroke-width", maze.wall.width/5);
	  maze.data[y][x].data.setAttribute("stroke-linecap", "square");
	  maze.data[y][x].data.setAttribute("stroke", "black");
	}
  }

  for(var y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
    for(var x=(gridX-1); x>(gridX-1-maze.wall.outerWall); x--){
	  maze.data[y][x].specialStatus = "obstacle";
      maze.data[y][x].data.remove();
	  maze.data[y][x].data = makeRect((x*gridSize), (y*gridSize), gridSize, gridSize, maze.wall.grayScale, 1);
	  maze.data[y][x].data.setAttribute("stroke-width", maze.wall.width/5);
	  maze.data[y][x].data.setAttribute("stroke-linecap", "square");
	  maze.data[y][x].data.setAttribute("stroke", "black");
	}
  }  

  currentCell = [Math.floor(Math.random()*(gridY-(maze.wall.outerWall*2)))+maze.wall.outerWall, Math.floor(Math.random()*(gridX-(maze.wall.outerWall*2)))+maze.wall.outerWall,];

  path = [currentCell];

  maze.data[currentCell[0]][currentCell[1]].visited = true;
  maze.data[currentCell[0]][currentCell[1]].data.setAttribute("opacity", 1);
  maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", "black");
}

setUpEntrance();
function setUpEntrance(){
  //player1 Entrance
  for(var y=gridY-1; y>gridY-1-maze.wall.outerWall; y--){
    for(var x=gridX-1-maze.wall.outerWall; x>gridX-1-maze.wall.outerWall-3; x--){
      var i = entrance.player1.mainWall.length;
      entrance.player1.mainWall[i] = new Object;
      entrance.player1.mainWall[i].x = x;
      entrance.player1.mainWall[i].y = y;  
    }  
  }  
  for(var x=gridX-1-maze.wall.outerWall; x>gridX-1-maze.wall.outerWall-3; x--){
    var i = entrance.player1.path.length;
    entrance.player1.path[i] = new Object;
    entrance.player1.path[i].x = x;
    entrance.player1.path[i].y = y;      
  }
  entrance.player1.collidableObject = makeRect((gridX-maze.wall.outerWall-3)*gridSize, (gridY-maze.wall.outerWall)*gridSize, gridSize*3, (gridSize*maze.wall.outerWall), "black", 0);
  entrance.player1.mainWall.reverse();  
    
  //player2 Entrance
  for(var y=gridY-1; y>gridY-1-maze.wall.outerWall; y--){
    for(var x=gridX-5-maze.wall.outerWall; x>gridX-5-maze.wall.outerWall-3; x--){
      var i = entrance.player2.mainWall.length;
      entrance.player2.mainWall[i] = new Object;
      entrance.player2.mainWall[i].x = x;
      entrance.player2.mainWall[i].y = y;  
    }  
  }
  for(var x=gridX-5-maze.wall.outerWall; x>gridX-5-maze.wall.outerWall-3; x--){
    var i = entrance.player2.path.length;
    entrance.player2.path[i] = new Object;
    entrance.player2.path[i].x = x;
    entrance.player2.path[i].y = y;      
  }
  entrance.player2.collidableObject = makeRect((gridX-maze.wall.outerWall-7)*gridSize, (gridY-maze.wall.outerWall)*gridSize, gridSize*3, (gridSize*maze.wall.outerWall), "black", 0);
  entrance.player2.mainWall.reverse();
    
  //minotaur Entrance
  for(var y=0; y<maze.wall.outerWall; y++){
    for(var x=maze.wall.outerWall; x<maze.wall.outerWall+3; x++){
      var i = entrance.minotaur.mainWall.length;
      entrance.minotaur.mainWall[i] = new Object;
      entrance.minotaur.mainWall[i].x = x;
      entrance.minotaur.mainWall[i].y = y;  
    }  
  }
  for(var x=maze.wall.outerWall; x<maze.wall.outerWall+3; x++){
    var i = entrance.minotaur.path.length;
    entrance.minotaur.path[i] = new Object;
    entrance.minotaur.path[i].x = x;
    entrance.minotaur.path[i].y = y;      
  }
  entrance.minotaur.collidableObject = makeRect((maze.wall.outerWall)*gridSize, (0)*gridSize, gridSize*3, (gridSize*maze.wall.outerWall), "black", 0);
}

function changeGameMode(data){
  document.getElementById("modeScreen").style.display = "none";
  document.getElementById(data + "Screen").style.display = "block";  
  gameMode = data;  
}

function changeAmountOfPlayer(data){  
  amountOfPlayer = data;
    
  if(gameMode == "survival" && amountOfPlayer == 2){
    document.getElementById("survivalDecisionArea").innerHTML = "<h2>Who will be the Minotaur?</h2><br><button id='minotaurOneButton' onclick='decideMinotaurPlayer(0)'>Player 1</button><button id='minotaurTwoButton' onclick='decideMinotaurPlayer(1)'>Player 2</button>";  
  }
  else{ 
    document.getElementById(gameMode + "Screen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    gameInitiation(); 
  }
}

function decideMinotaurPlayer(data){  
  document.getElementById(gameMode + "Screen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  minotaurPlayer = data;
  player[minotaurPlayer].tag = "minotaur";
  player[minotaurPlayer].kinematic.speed = minotaurSpeed;  
    
  gameInitiation(); 
}

function gameInitiation(){  
  updateInput();
  document.addEventListener('keypress', skipMazeCreation);  
  generateMaze();  
  createCharacter();
  addGameColor();    
}

function updateInput(){
  amountOfMinotaur = Number(document.getElementById("enemySpawnSlider").value);
  survivalTime.minute = Number(document.getElementById("timeSlider").value); 
  sessionStorage.amountOfMinotaur = amountOfMinotaur;
  sessionStorage.survivalTime = survivalTime.minute;  
  if(gameMode == "survival"){
    amountOfMinotaur = 1;  
  }  
}

inputApplication();
function inputApplication(){
  if(sessionStorage.amountOfMinotaur){
    document.getElementById("enemySpawnSlider").value = sessionStorage.amountOfMinotaur;
    document.getElementById("timeSlider").value = sessionStorage.survivalTime;
    
    document.getElementById("enemySpawnValue").innerHTML = sessionStorage.amountOfMinotaur;
    document.getElementById("timeValue").innerHTML = sessionStorage.survivalTime;
  }
}


//Maze Generation

function generateMaze() {
  if(maze.creationSpeed == "whileLoop"){
	while(visited < gridTotal && currentCell){
      var potential = [[currentCell[0]-1, currentCell[1], "top", "bottom"], [currentCell[0], currentCell[1]-1, "left", "right"], [currentCell[0]+1, currentCell[1], "bottom", "top"], [currentCell[0], currentCell[1]+1, "right", "left"],]; 

      var neighbors = new Array();
      for (var i = 0, length=potential.length; i < length; i++) {
        if (potential[i][0] > (-1+maze.wall.outerWall) && potential[i][0] < (gridY-maze.wall.outerWall) && potential[i][1] > (-1+maze.wall.outerWall) && potential[i][1] < (gridX-maze.wall.outerWall) && !maze.data[potential[i][0]][potential[i][1]].visited){
          neighbors.push(potential[i]);
        }
      }
      if (neighbors.length) {
        var next = neighbors[Math.floor(Math.random()*neighbors.length)];
		maze.data[currentCell[0]][currentCell[1]].wall[next[2]] = false;
        maze.data[next[0]][next[1]].wall[next[3]] = false;
	 	maze.data[next[0]][next[1]].visited = true;
        visited += 1;
		
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", maze.path.grayScale);
	    updateMazeWall(currentCell[1], currentCell[0]);
	    currentCell = [next[0], next[1]];
	    updateMazeWall(currentCell[1], currentCell[0]);
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("opacity", 1);
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", "black");
        path.push(currentCell);
      } 
      else {
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", maze.path.grayScale);
	    updateMazeWall(currentCell[1], currentCell[0]);
        currentCell = path.pop();
		if(currentCell){
          maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", "black");
		}
      }
    }
	maze.creationSpeed = "requestAnimationFrame";
  }
  else if(maze.creationSpeed == "requestAnimationFrame"){
	if(currentCell){
      var potential = [[currentCell[0]-1, currentCell[1], "top", "bottom"], [currentCell[0], currentCell[1]-1, "left", "right"], [currentCell[0]+1, currentCell[1], "bottom", "top"], [currentCell[0], currentCell[1]+1, "right", "left"],]; 

      var neighbors = new Array();
      for (var i = 0, length=potential.length; i < length; i++) {
        if (potential[i][0] > (-1+maze.wall.outerWall) && potential[i][0] < (gridY-maze.wall.outerWall) && potential[i][1] > (-1+maze.wall.outerWall) && potential[i][1] < (gridX-maze.wall.outerWall) && !maze.data[potential[i][0]][potential[i][1]].visited){ 
          neighbors.push(potential[i]); 
        }
      }
	  if (neighbors.length) {
        var next = neighbors[Math.floor(Math.random()*neighbors.length)];
		maze.data[currentCell[0]][currentCell[1]].wall[next[2]] = false;
        maze.data[next[0]][next[1]].wall[next[3]] = false;
	 	maze.data[next[0]][next[1]].visited = true;
        visited += 1;
	    updateMazeWall(currentCell[1], currentCell[0]);
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", maze.path.grayScale);
	    currentCell = [next[0], next[1]];
	    updateMazeWall(currentCell[1], currentCell[0]);
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("opacity", 1);
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", "black");
        path.push(currentCell);
      } 
      else {
        maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", maze.path.grayScale);
	    updateMazeWall(currentCell[1], currentCell[0]);
        currentCell = path.pop();
		if(currentCell){
          maze.data[currentCell[0]][currentCell[1]].data.setAttribute("fill", "black");
        }
      }
    }
  	if(visited < gridTotal){
  	  requestAnimationFrame(generateMaze);
  	}
  }
}

function updateMazeWall(x, y){
  //top, left, bottom, right border
  if(maze.data[y][x].wall.top && maze.data[y][x].wall.left && maze.data[y][x].wall.bottom && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", (gridSize*4));
  }

  //top, left, bottom border
  else if(maze.data[y][x].wall.top  && maze.data[y][x].wall.left && maze.data[y][x].wall.bottom){
	maze.data[y][x].data.setAttribute("stroke-dasharray", gridSize + ", " + gridSize + ", " + (gridSize*2));
  }
  //top, left, right border
  else if(maze.data[y][x].wall.top  && maze.data[y][x].wall.left && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", (gridSize*2) + ", " + gridSize);
  }	
  //top, bottom, right border
  else if(maze.data[y][x].wall.top  && maze.data[y][x].wall.bottom && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", (gridSize*3) + ", " + gridSize);
  }
  //left, bottom, right border
  else if(maze.data[y][x].wall.left  && maze.data[y][x].wall.bottom && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + gridSize + ", " + (gridSize*3));
  }
	
  //top, left border
  else if(maze.data[y][x].wall.top && maze.data[y][x].wall.left){
	maze.data[y][x].data.setAttribute("stroke-dasharray", gridSize + ", " + (gridSize*2));
  }
  //top, bottom border
  else if(maze.data[y][x].wall.top && maze.data[y][x].wall.bottom){
	maze.data[y][x].data.setAttribute("stroke-dasharray", gridSize + ", " + gridSize, ", " + gridSize + ", " + gridSize);
  }
  //top, right border
  else if(maze.data[y][x].wall.top && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", (gridSize*2) + ", " + (gridSize*2));
  }
  //left, bottom border
  else if(maze.data[y][x].wall.left && maze.data[y][x].wall.bottom){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + (gridSize*2) + ", " + (gridSize*2));
  }
  //left, right border
  else if(maze.data[y][x].wall.left && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + gridSize + ", " + gridSize + ", 0");
  }	
  //bottom, right border
  else if(maze.data[y][x].wall.bottom && maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + gridSize + ", " + (gridSize*2) + ", 0");
  }
	
  //top border
  else if(maze.data[y][x].wall.top){
	maze.data[y][x].data.setAttribute("stroke-dasharray", gridSize + ", " + (gridSize*3));
  }
  //left border
  else if(maze.data[y][x].wall.left){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + (gridSize*3) +  ", " + gridSize);
  }
  //bottom border
  else if(maze.data[y][x].wall.bottom){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + (gridSize*2) + ", " + gridSize + ", " + gridSize);
  }
  //right border
  else if(maze.data[y][x].wall.right){
	maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + gridSize + ", " + gridSize + ", " + (gridSize*2));
  }
    
  else{
    maze.data[y][x].data.setAttribute("stroke-dasharray", "0, " + (gridSize*4));
  }
}

function skipMazeCreation(event){
  if(event.keyCode == 32){
	maze.creationSpeed = "whileLoop";
  }
}
/*
var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

function startAnimation(fps) {
    fpsInterval = 1000 / fps;
    then = window.performance.now();
    startTime = then;
    console.log(startTime);
    gameAnimation();
}

function gameAnimation(newtime) {
  // calc elapsed time since last loop
  now = newtime;
  elapsed = now - then;
  // if enough time has elapsed, draw the next frame
  if (elapsed > fpsInterval) {
    // Get ready for next frame by setting then=now, but...
    // Also, adjust for fpsInterval not being multiple of 16.67
    then = now - (elapsed % fpsInterval);
    // draw stuff here   
*/



//Set Up Characters

function createCharacter(){
  if(visited >= gridTotal){  
    //Entrance for Player 1 
    createEntrance("player1");  
      
    //Exit/Gate for minotaur  
    createEntrance("minotaur");
      
    if(gameMode == "escape" && amountOfPlayer == 1){    
      player[0].data = makeImage("Images/Character/Player 1.png", (gridX-3)*gridSize, (gridY-1)*gridSize, gridSize, gridSize, 1);     
      player[0].location.x = (gridX-3)*gridSize;      
      player[0].location.y = (gridY-1)*gridSize;      
      player[0].location.unitX = (gridX-3);      
      player[0].location.unitY = (gridY-1); 
    }  
    else if(gameMode == "escape" && amountOfPlayer == 2){     
      createEntrance("player2");
      player[0].data = makeImage("Images/Character/Player 1.png", (gridX-7)*gridSize, (gridY-1)*gridSize, gridSize, gridSize, 1);      
      player[0].location.x = (gridX-7)*gridSize;      
      player[0].location.y = (gridY-1)*gridSize;      
      player[0].location.unitX = (gridX-7);      
      player[0].location.unitY = (gridY-1);
        
      player[1].data = makeImage("Images/Character/Player 2.png", (gridX-3)*gridSize, (gridY-1)*gridSize, gridSize, gridSize, 1);            
      player[1].location.x = (gridX-3)*gridSize;      
      player[1].location.y = (gridY-1)*gridSize;      
      player[1].location.unitX = (gridX-3);      
      player[1].location.unitY = (gridY-1);
    } 
    else if(gameMode == "survival" && amountOfPlayer == 1){
      player[0].data = makeImage("Images/Character/Player 1.png", (gridX-3)*gridSize, (gridY-1)*gridSize, gridSize, gridSize, 1);      
      player[0].location.x = (gridX-3)*gridSize;      
      player[0].location.y = (gridY-1)*gridSize;      
      player[0].location.unitX = (gridX-3);      
      player[0].location.unitY = (gridY-1);     
      minotaur[0] = { data: makeImage("Images/Character/Minotaur.png", (maze.wall.outerWall+1)*gridSize, (maze.wall.outerWall-1)*gridSize, gridSize, gridSize, 1), location: {x: (maze.wall.outerWall+1)*gridSize, y: (maze.wall.outerWall-1)*gridSize, unitX: (maze.wall.outerWall+1), unitY: (maze.wall.outerWall-1),}, kinematic: {direction: {current: "none", expected: "none"}, moveX: 0, moveY: 0,}, trackCoolDown: {current: 0, add: 3,}, speed: {inactive: 1, active: 2.5, offensive: 4,}, targetLock: "inactive", stunTime: {current: 0, add: 20,}, path: [], kill: false, }; 
    }  
    else if(gameMode == "survival" && amountOfPlayer == 2){
      for(var i=0; i<amountOfPlayer; i++){  
        if(player[i].tag == "hero"){ 
          player[i].data = makeImage("Images/Character/Player " + (i+1) + ".png", (gridX-3)*gridSize, (gridY-1)*gridSize, gridSize, gridSize, 1);      
          player[i].location.x = (gridX-3)*gridSize;      
          player[i].location.y = (gridY-1)*gridSize;      
          player[i].location.unitX = (gridX-3);      
          player[i].location.unitY = (gridY-1);
          
          var h = versus["player" + (i+1)];
          player[h].data = makeImage("Images/Character/Minotaur.png", (maze.wall.outerWall+1)*gridSize, (maze.wall.outerWall-1)*gridSize, gridSize, gridSize, 1);      
          player[h].location.x = (maze.wall.outerWall+1)*gridSize;      
          player[h].location.y = (maze.wall.outerWall-1)*gridSize;      
          player[h].location.unitX = (maze.wall.outerWall+1);      
          player[h].location.unitY = (maze.wall.outerWall-1);
        }
      }
    }
    if(gameMode == "escape"){
      var x = 0;
      var y = 0;
      for(var i=0; i<amountOfPlayer; i++){
        maze.data[player[i].location.unitY][player[i].location.unitX].specialStatus = "player";  
        for(var h=0, length=entrance["player" + (i+1)].path.length; h<length; h++){
          var x = entrance["player" + (i+1)].path[h].x;
          var y = entrance["player" + (i+1)].path[h].y;
          maze.data[y][x].wall[entrance["player" + (i+1)].specialWall] = false;  
        }    
      }   
         
      for(var i=0; i<amountOfMinotaur; i++){
        x = 0;
        y = 0;
        while(x == 0 && y == 0){   
          x = (Math.floor(Math.random()*(gridX-(maze.wall.outerWall*2)))+maze.wall.outerWall)*gridSize;
          y = (Math.floor(Math.random()*(gridY-(maze.wall.outerWall*2)))+maze.wall.outerWall)*gridSize;  
          for(var o=0, length=minotaur.length; o<length; o++){
            if(x == minotaur[o].location.x && y == minotaur[o].location.y){
              x = 0;
              y = 0;
            }  
          }
          if(x != 0 || y != 0){  
            minotaur[i] = { data: makeImage("Images/Character/Minotaur.png", x, y, gridSize, gridSize, 1), location: {x: x, y: y, unitX: x/gridSize, unitY: y/gridSize,}, kinematic: {direction: {current: "none", expected: "none"}, moveX: 0, moveY: 0,}, trackCoolDown: {current: 0, add: 3,}, speed: {inactive: 1, active: 2.5, offensive: 4,}, targetLock: "inactive", stunTime: {current: 0, add: 20,}, path: [], kill: false, };    
            minotaur[i].path = trackingAI(i, "none", 25);  
            if(minotaur[i].targetLock == "active"){
              x = 0;
              y = 0;
            }
            minotaur[i].data.remove();  
          }
        }
        minotaur[i] = { data: makeImage("Images/Character/Minotaur.png", x, y, gridSize, gridSize, 1), location: {x: x, y: y, unitX: x/gridSize, unitY: y/gridSize,}, kinematic: {direction: {current: "none", expected: "none"}, moveX: 0, moveY: 0,}, trackCoolDown: {current: 0, add: 3,}, speed: {inactive: 1, active: 2.5, offensive: 4,}, targetLock: "inactive", stunTime: {current: 0, add: 20,}, path: [], kill: false, };  
      }
      for(var i=0; i<amountOfPlayer; i++){
        maze.data[player[i].location.unitY][player[i].location.unitX].specialStatus = "obstacle";  
        for(var h=0, length=entrance["player" + (i+1)].path.length; h<length; h++){
          var x = entrance["player" + (i+1)].path[h].x;
          var y = entrance["player" + (i+1)].path[h].y;
          maze.data[y][x].wall[entrance["player" + (i+1)].specialWall] = true;  
        } 
      }  
    }  
      
    document.removeEventListener('keypress', skipMazeCreation);    
  }
  else{
    requestAnimationFrame(createCharacter);      
  }  
}

function createEntrance(subject){
  for(var i=0, length=entrance[subject].mainWall.length; i<length; i++){
    var x = entrance[subject].mainWall[i].x;
    var y = entrance[subject].mainWall[i].y;  
    maze.data[y][x].data.setAttribute("opacity", 0);
    maze.data[y][x].wall.top = false;
    maze.data[y][x].wall.left = false;
    maze.data[y][x].wall.bottom = false;
    maze.data[y][x].wall.right = false;  
    maze.data[y][x].wall[entrance[subject].specialWall] = true;
  }
  
  maze.data[entrance[subject].mainWall[0].y][entrance[subject].mainWall[0].x].wall.left = true;
  maze.data[entrance[subject].mainWall[entrance[subject].mainWall.length-1].y][entrance[subject].mainWall[entrance[subject].mainWall.length-1].x].wall.right = true;
    
  for(var i=0, length=entrance[subject].path.length; i<length; i++){
    var x = entrance[subject].path[i].x;
    var y = entrance[subject].path[i].y;
    maze.data[y][x].wall[entrance[subject].specialWall] = false;  
    updateMazeWall(x, y);  
    if(gameMode == "survival" || subject == "player1" || subject == "player2"){  
      maze.data[y][x].wall[entrance[subject].specialWall] = true; 
    }
  }      
}

// Add color to maze
function addGameColor(){
  if(visited >= gridTotal){
    for(var y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
  	  for(var x=maze.wall.outerWall; x<(gridX-maze.wall.outerWall); x++){
  	    maze.data[y][x].data.setAttribute("fill", maze.path.color);
        maze.data[y][x].data.setAttribute("stroke", maze.wall.color);
	  }
    }

    for(var y=0; y<maze.wall.outerWall; y++){ 
  	  for(var x=0; x<gridX; x++){
  	    maze.data[y][x].data.setAttribute("fill", maze.wall.color);
        maze.data[y][x].data.setAttribute("stroke", "black");
	  }
    }

    for(var y=(gridY-1); y>(gridY-1-maze.wall.outerWall); y--){
	  for(var x=0; x<gridX; x++){
  	    maze.data[y][x].data.setAttribute("fill", maze.wall.color);
        maze.data[y][x].data.setAttribute("stroke", "black");
	  }
    }

    for(y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
      for(var x=0; x<maze.wall.outerWall; x++){
  	    maze.data[y][x].data.setAttribute("fill", maze.wall.color);
        maze.data[y][x].data.setAttribute("stroke", "black");
	  }
    }

    for(var y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
      for(var x=(gridX-1); x>(gridX-1-maze.wall.outerWall); x--){
  	    maze.data[y][x].data.setAttribute("fill", maze.wall.color);
        maze.data[y][x].data.setAttribute("stroke", "black");
	  }
    }
    
    document.getElementById("canvas").style.background = maze.path.color;
    if(gameMode == "escape" && !sessionStorage.escape){ sessionStorage.escape = true; displayTutorialAgain(); }  
    else if(gameMode == "survival" && !sessionStorage.survival){ sessionStorage.survival = true; displayTutorialAgain(); }
    else{ document.addEventListener('keydown', updatePlayerInput); gameStatus = "mainPhase"; gameAnimation(); }      
  }
  else{
    requestAnimationFrame(addGameColor);
  }
}



//Game Animation initiation

function gameAnimation(){
  playerAnimation();
  removeEntrance("player1");
  if(gameMode == "escape"){  
    removeExit();  
  }
  if(gameMode == "escape" && amountOfPlayer == 2){
    removeEntrance("player2");
  }  
  if(minotaur.length != 0){  
    minotaurAnimation();  
  }
  if(gameMode == "survival"){
    removeEntrance("minotaur");
      
    minute = survivalTime.minute;  
    if(minute < 10){
      minute = "0" + minute;  
    }  
    timer = makeText(minute + ":00", 23, 17, 20, "Special Elite", "black", 0);
  }  
}

function removeEntrance(subject){
  var characterCollision = false;  
  if(subject == "player1"){
    if(amountOfPlayer == 1 || minotaurPlayer == 1){  
      if(collides(player[0].data, entrance[subject].collidableObject)){
        characterCollision = true;    
      }
    }
    else if(amountOfPlayer == 2 && gameMode == "escape" || minotaurPlayer == 0){  
      if(collides(player[1].data, entrance[subject].collidableObject)){
        characterCollision = true;  
      }
    }  
  }    
  else if(subject == "player2"){
    if(collides(player[0].data, entrance[subject].collidableObject)){
      characterCollision = true;  
    }
  }  
  else if(subject == "minotaur"){
    if(amountOfPlayer == 1){  
        if(collides(minotaur[0].data, entrance[subject].collidableObject)){
        characterCollision = true;  
      }
    } 
    else if(amountOfPlayer == 2){  
      if(collides(player[minotaurPlayer].data, entrance[subject].collidableObject)){
        characterCollision = true;  
      }  
    }  
  }    
  if(characterCollision){
    requestAnimationFrame(function(){ removeEntrance(subject); });
  }  
  else{  
    if(gameMode == "survival" && subject == "player1"){
      timerId = setInterval(countdown, 1000); 
    } 
    if(gameMode == "survival" && subject == "minotaur"){
      timer.setAttribute("opacity", 1);  
    }  
    for(var i=0, length=entrance[subject].mainWall.length; i<length; i++){
      var x = entrance[subject].mainWall[i].x;
      var y = entrance[subject].mainWall[i].y;
      if(subject != "minotaur"){  
        maze.data[y][x].data.setAttribute("opacity", 1);
      }
      maze.data[y][x].wall.top = true;
      maze.data[y][x].wall.left = true;
      maze.data[y][x].wall.bottom = true;
      maze.data[y][x].wall.right = true;  
    } 
    for(var i=0, length=entrance[subject].path.length; i<length; i++){
      var x = entrance[subject].path[i].x;
      var y = entrance[subject].path[i].y;
      maze.data[y][x].wall[entrance[subject].specialWall] = true;  
      updateMazeWall(x, y);  
    }      
  }  
}

function removeExit(){
  var mazeEscape = "false";  
  for(var i=0; i<amountOfPlayer; i++){  
    if(collides(player[i].data, entrance.minotaur.collidableObject)){
      mazeEscape = i;  
    }
  }
  if(mazeEscape == 0 || mazeEscape == 1){
    player[mazeEscape].data.setAttribute("opacity", 0);   
    for(var i=0, length=entrance.minotaur.mainWall.length; i<length; i++){
      var x = entrance.minotaur.mainWall[i].x;
      var y = entrance.minotaur.mainWall[i].y;  
      maze.data[y][x].data.setAttribute("opacity", 1);
      maze.data[y][x].wall.top = true;
      maze.data[y][x].wall.left = true;
      maze.data[y][x].wall.bottom = true;
      maze.data[y][x].wall.right = true;  
    } 
    for(var i=0, length=entrance.minotaur.path.length; i<length; i++){
      var x = entrance.minotaur.path[i].x;
      var y = entrance.minotaur.path[i].y;
      maze.data[y][x].wall[entrance.minotaur.specialWall] = true;  
      updateMazeWall(x, y);  
    } 
    gameOver();  
  } 
  else{
    requestAnimationFrame(removeExit);  
  }  
}

function countdown(){
  var minute = survivalTime.minute;
  var second = survivalTime.second;
  second -= 1;
  if(second == -1){
    second = 59;
    minute -= 1;  
  } 
  survivalTime.minute = minute;
  survivalTime.second = second;
    
  if(minute <= 0 && second <= 0){
    clearInterval(timerId);
    gameOver();  
  }
  if(second < 10){
    second = "0" + second;  
  }
  if(minute < 10){
    minute = "0" + minute;  
  }  
  timer.innerHTML = minute + ":" + second; 
  //timer = makeText(minute + ":" + second, 23, 17, 20, "Special Elite", "black", 1);
}


//Player animation

function playerAnimation(){        
  for(var i=0; i<amountOfPlayer; i++){ 
    if(!player[i].death){  
      if(player[i].location.x % gridSize == 0 && player[i].location.y % gridSize == 0){ 
        player[i].location.unitX = Math.round(player[i].location.x/gridSize);  
        player[i].location.unitY = Math.round(player[i].location.y/gridSize);  
        updatePlayerAnimation(i); 
        if(assist.status && i == 0){
          if(assist.coolDown.current == 0){
            if(gameMode == "escape"){
              findPath(player[0], entrance.minotaur.path[1]);  
            }  
            else if(gameMode == "survival" && amountOfPlayer == 1){
              findPath(player[0], minotaur[0]);  
            }  
            else if(gameMode == "survival" && amountOfPlayer == 2){
              findPath(player[0], player[1]);  
            }  
            assist.coolDown.current = assist.coolDown.add;  
          }
          else{
            assist.coolDown.current -= 1;  
          } 
          if(maze.data[player[i].location.unitY][player[i].location.unitX].data.getAttribute("fill") == maze.path.color){  
            maze.data[player[i].location.unitY][player[i].location.unitX].data.setAttribute("fill", "#483C32");
            maze.data[player[i].location.unitY][player[i].location.unitX].data.setAttribute("stroke", "black");   
          }  
          /*    
          else if(maze.data[player[i].location.unitY][player[i].location.unitX].data.getAttribute("fill") == "#483C32"){  
            maze.data[player[i].location.unitY][player[i].location.unitX].data.setAttribute("fill", maze.path.color);
            maze.data[player[i].location.unitY][player[i].location.unitX].data.setAttribute("stroke", maze.wall.color);  
          } 
          */
          if(player[i].death){
            assist.status = false;  
          }  
        }  
      }  
      player[i].location.x = player[i].location.x+player[i].kinematic.moveX;  
      player[i].location.x = Math.round(player[i].location.x*10)/10;  
      player[i].location.y = player[i].location.y+player[i].kinematic.moveY;  
      player[i].location.y = Math.round(player[i].location.y*10)/10;
      player[i].data.setAttribute("x", player[i].location.x);
      player[i].data.setAttribute("y", player[i].location.y);  
    }  
  }
  if(gameMode == "survival" && amountOfPlayer == 2 && !player[versus["player" + (minotaurPlayer+1)]].death){
    checkForPlayerCollision();  
  }  
  // request another frame
  if(gameStatus == "mainPhase"){ requestAnimationFrame(playerAnimation); }
  else if(gameStatus == "gameOver" && gameMode == "survival"){ requestAnimationFrame(playerAnimation); }
}

function updatePlayerAnimation(playerId){  
  if(maze.data[player[playerId].location.unitY][player[playerId].location.unitX].wall[player[playerId].kinematic.direction.expected]){
    player[playerId].kinematic.direction.expected = "none";  
  } 
    
  player[playerId].kinematic.direction.current = player[playerId].kinematic.direction.expected;
  player[playerId].kinematic.moveX = motionUnit[player[playerId].kinematic.direction.current].moveX * player[playerId].kinematic.speed;
  player[playerId].kinematic.moveY = motionUnit[player[playerId].kinematic.direction.current].moveY * player[playerId].kinematic.speed;
}

// Player Interactibility
function updatePlayerInput(event){
  var key = event.keyCode;
    
  // W Key  
  if(key == 87){
    player[0].kinematic.direction.expected = "top"; 
  }  
    
  // A Key  
  else if(key == 65){
    player[0].kinematic.direction.expected = "left"; 
  }  
    
  // S Key  
  else if(key == 83){
    player[0].kinematic.direction.expected = "bottom";   
  }  
    
  // D Key  
  else if(key == 68){
    player[0].kinematic.direction.expected = "right"; 
  }
  
  // Up Key  
  if(key == 38){
    player[1].kinematic.direction.expected = "top"; 
  }  
    
  // Left Key  
  else if(key == 37){
    player[1].kinematic.direction.expected = "left"; 
  }  
    
  // Down Key  
  else if(key == 40){
    player[1].kinematic.direction.expected = "bottom";  
  }  
    
  // Right Key  
  else if(key == 39){
    player[1].kinematic.direction.expected = "right"; 
  } 
  
  // R Key  
  if(key == 82){ gameStatus = "inactive"; setTimeout(restart, 200); }
  
  // T Key  
  if(key == 84){ gameStatus = "inactive"; setTimeout(returnToTitleScreen, 200); }
  
  // I/H Key  
  if(key == 73 || key == 72){ displayTutorialAgain(); }

  if(key == 32){
    if(assist.status){
      assist.status = false;
      for(var y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
        for(var x=maze.wall.outerWall; x<(gridX-maze.wall.outerWall); x++){
          maze.data[y][x].data.setAttribute("fill", maze.path.color);
          maze.data[y][x].data.setAttribute("stroke", maze.wall.color);
  	    }
      }    
    }  
    else{  
      assist.status = true;
      assist.coolDown.current = 0;  
    }
  }
}

function checkForPlayerCollision(){
  if(collides(player[0].data, player[1].data)){
    player[versus["player" + (minotaurPlayer+1)]].death = true;
    player[versus["player" + (minotaurPlayer+1)]].data.setAttribute("opacity", 0);  
    setTimeout(function(){
      if(player[versus["player" + (minotaurPlayer+1)]].death){   
        player[versus["player" + (minotaurPlayer+1)]].data.setAttribute("opacity", 1);
        player[versus["player" + (minotaurPlayer+1)]].data.setAttribute("xlink:href", "Images/Character/Gravestone.png");  
      }
    }, 1000);
    clearInterval(timerId);  
    gameOver();
  }
}


//Hint 

function findPath(origin, end){
  
  for(var y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
    for(var x=maze.wall.outerWall; x<(gridX-maze.wall.outerWall); x++){
      maze.data[y][x].data.setAttribute("fill", "#483C32");
      maze.data[y][x].data.setAttribute("stroke", "black");  
	  maze.data[y][x].specialStatus = "none";
	}
  }  
  if(typeof end.location == "undefined"){  
    maze.data[end.x][end.y].specialStatus = "goal"; 
  }
  else{
    maze.data[end.location.unitY][end.location.unitX].specialStatus = "goal"; 
  }  
    
  var distanceFromTop = origin.location.unitY;
  var distanceFromLeft = origin.location.unitX;

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  var location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: 'start'
  };

  // Initialize the queue with the start location already inside
  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0) {
    // Take the first location off the queue
    var currentLocation = queue.shift();
    var possibleDirection = ["top", "left", "right", "bottom"];  
    while(possibleDirection.length > 0){
      var random  = Math.floor(Math.random()*possibleDirection.length);  
      var chosenDirection = possibleDirection[random];
      possibleDirection.splice(random, 1);
      if(!maze.data[currentLocation.distanceFromTop][currentLocation.distanceFromLeft].wall[chosenDirection]){
        var newLocation = exploreInDirection(currentLocation, chosenDirection, "findPath");
        if (newLocation.status === 'goal') {
          //console.log(newLocation.status)
          //console.log(newLocation.path)  
          for(var i=0, length=newLocation.path.length-1; i<length; i++){
            maze.data[newLocation.path[i][0]][newLocation.path[i][1]].data.setAttribute("fill", maze.path.color);
            maze.data[newLocation.path[i][0]][newLocation.path[i][1]].data.setAttribute("stroke", maze.wall.color);  
          }
        } else if (newLocation.status === 'valid') {  
          queue.push(newLocation);  
        }
      }
    }
  }
    
  return newLocation.path;
}



//Minotaur animation

function minotaurAnimation(){         
  for(var i=0; i<amountOfMinotaur; i++){
    if(minotaur[i].location.x % gridSize == 0 && minotaur[i].location.y % gridSize == 0){ 
      minotaur[i].location.unitX = Math.round(minotaur[i].location.x/gridSize);  
      minotaur[i].location.unitY = Math.round(minotaur[i].location.y/gridSize);  
      updateMinotaurAnimation(i); 
    if(gameMode == "survival" && assist.status && maze.data[minotaur[i].location.unitY][minotaur[i].location.unitX].data.getAttribute("fill") == maze.path.color){  
      maze.data[minotaur[i].location.unitY][minotaur[i].location.unitX].data.setAttribute("fill", "#483C32");
      maze.data[minotaur[i].location.unitY][minotaur[i].location.unitX].data.setAttribute("stroke", "black");   
    }  
    }    
    minotaur[i].location.x = minotaur[i].location.x+minotaur[i].kinematic.moveX;  
    minotaur[i].location.x = Math.round(minotaur[i].location.x*10)/10;  
    minotaur[i].location.y = minotaur[i].location.y+minotaur[i].kinematic.moveY;  
    minotaur[i].location.y = Math.round(minotaur[i].location.y*10)/10;
    minotaur[i].data.setAttribute("x", minotaur[i].location.x);
    minotaur[i].data.setAttribute("y", minotaur[i].location.y);
    checkForMinotaurCollision(i);  
  }
  if(gameStatus == "mainPhase" || gameStatus == "gameOver"){
    requestAnimationFrame(minotaurAnimation);  
  }  
}

function updateMinotaurAnimation(minotaurId){
  if(minotaur[minotaurId].stunTime.current == 0){
    if(minotaur[minotaurId].targetLock == "offensive"){
      if(maze.data[minotaur[minotaurId].location.unitY][minotaur[minotaurId].location.unitX].wall[minotaur[minotaurId].kinematic.direction.current]){ 
        minotaur[minotaurId].path = [];   
        minotaur[minotaurId].targetLock = "active";   
        if(minotaur[minotaurId].kill){
          minotaur[minotaurId].targetLock = "inactive";    
          minotaur[minotaurId].kill = false;
        }  
        minotaur[minotaurId].stunTime.current = minotaur[minotaurId].stunTime.add;
      }
    }
    else if(minotaur[minotaurId].targetLock == "active"){
      if(minotaur[minotaurId].trackCoolDown.current == 0){
        if(gameMode == "escape"){  
          minotaur[minotaurId].path = trackingAI(minotaurId, motionUnit[minotaur[minotaurId].kinematic.direction.current].opposite, 30);
        }
        else{  
          minotaur[minotaurId].path = trackingAI(minotaurId, motionUnit[minotaur[minotaurId].kinematic.direction.current].opposite, 150);
        }
        minotaur[minotaurId].trackCoolDown.current = minotaur[minotaurId].trackCoolDown.add; 
        if(minotaur[minotaurId].kill){
          minotaur[minotaurId].targetLock = "inactive"; 
          minotaur[minotaurId].kill = false;  
        }  
      }  
      else{
        minotaur[minotaurId].trackCoolDown.current -= 1; 
      }
      checkForOffensiveStance(minotaurId, minotaur[minotaurId].kinematic.direction.current);  
    }
    else if(minotaur[minotaurId].targetLock == "inactive"){
      if(minotaur[minotaurId].trackCoolDown.current == 0){
        if(gameMode == "escape"){  
          minotaur[minotaurId].path = trackingAI(minotaurId, motionUnit[minotaur[minotaurId].kinematic.direction.current].opposite, 20);  
        }
        else{
          minotaur[minotaurId].path = trackingAI(minotaurId, motionUnit[minotaur[minotaurId].kinematic.direction.current].opposite, 100);  
        }
        //console.log(minotaur[minotaurId].path)  
        minotaur[minotaurId].trackCoolDown.current = minotaur[minotaurId].trackCoolDown.add;
      }  
      else{
        minotaur[minotaurId].trackCoolDown.current -= 1; 
      }  
    }
  
    if(minotaur[minotaurId].targetLock == "active" || minotaur[minotaurId].targetLock == "inactive"){
      if(minotaur[minotaurId].path.length == 0){
        minotaur[minotaurId].path = ["none"];  
        minotaur[minotaurId].trackCoolDown.current = 0; 
        minotaur[minotaurId].stunTime.current = minotaur[minotaurId].stunTime.add;  
      }     
      minotaur[minotaurId].kinematic.direction.expected = minotaur[minotaurId].path.shift();
    }  
  }    
  else{
    minotaur[minotaurId].stunTime.current -= 1;  
  }
    
    minotaur[minotaurId].kinematic.direction.current = minotaur[minotaurId].kinematic.direction.expected;
    minotaur[minotaurId].kinematic.moveX = motionUnit[minotaur[minotaurId].kinematic.direction.current].moveX * minotaur[minotaurId].speed[minotaur[minotaurId].targetLock];
    minotaur[minotaurId].kinematic.moveY = motionUnit[minotaur[minotaurId].kinematic.direction.current].moveY * minotaur[minotaurId].speed[minotaur[minotaurId].targetLock]; 
}

function checkForMinotaurCollision(minotaurId){
  for(var i=0; i<amountOfPlayer; i++){  
    if(!player[i].death){  
      if(collides(minotaur[minotaurId].data, player[i].data)){
        player[i].death = true;
        player[i].data.setAttribute("opacity", 0);  
        setTimeout(function(){
          for(var h=0; h<amountOfPlayer; h++){
            if(player[h].death){   
              player[h].data.setAttribute("opacity", 1);
              player[h].data.setAttribute("xlink:href", "Images/Character/Gravestone.png");  
            }
          }
        }, 1000);
        var survivor = false;  
        minotaur[minotaurId].kill = true;
        minotaur[minotaurId].trackCoolDown.current = 0;
        for(var h=0; h<amountOfPlayer; h++){
          if(!player[h].death){
            survivor = true;  
          }  
        }
        if(survivor){
          var h = versus["player" + (i+1)];
          var image = player[h].data.getAttribute("xlink:href");
          player[h].data.remove();
          player[h].data = makeImage(image, player[h].location.x, player[h].location.y, gridSize, gridSize, 1);
        }  
        else{
          gameOver();  
        }  
      }
    }  
  }
}

function checkForOffensiveStance(minotaurId, direction){
  var wallCollision = false;
  var unit = 0;
  while(!wallCollision && direction != "none"){  
    if(maze.data[minotaur[minotaurId].location.unitY + (motionUnit[direction].moveY*unit)][minotaur[minotaurId].location.unitX + (motionUnit[direction].moveX*unit)].wall[direction]){
      wallCollision = true;  
    } 
    else{
      unit += 1;  
      for(var i=0; i<amountOfPlayer; i++){ 
        if(player[i].location.unitX == minotaur[minotaurId].location.unitX + (motionUnit[direction].moveX*unit) &&
           player[i].location.unitY == minotaur[minotaurId].location.unitY + (motionUnit[direction].moveY*unit) && !player[i].death){
          minotaur[minotaurId].targetLock = "offensive";  
        }  
      }  
    }  
  }  
}

// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
function trackingAI(minotaurId, backward, maxLength){
  
  for(var y=maze.wall.outerWall; y<(gridY-maze.wall.outerWall); y++){
    for(var x=maze.wall.outerWall; x<(gridX-maze.wall.outerWall); x++){
	  maze.data[y][x].specialStatus = "none";
	}
  }  
  for(var i=0; i<amountOfPlayer; i++){
    if(!player[i].death && maze.data[player[i].location.unitY][player[i].location.unitX].specialStatus != "obstacle"){  
      maze.data[player[i].location.unitY][player[i].location.unitX].specialStatus = "goal";  
    }
  }
  
  var invalidDirection = backward;  
    
  var distanceFromTop = minotaur[minotaurId].location.unitY;
  var distanceFromLeft = minotaur[minotaurId].location.unitX;

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  var location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: 'start'
  };

  // Initialize the queue with the start location already inside
  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0 && queue[0].path.length < (maxLength+1)) {
    // Take the first location off the queue
    var currentLocation = queue.shift();
    var possibleDirection = ["top", "left", "right", "bottom"];  
    while(possibleDirection.length > 0){
      var random  = Math.floor(Math.random()*possibleDirection.length);  
      var chosenDirection = possibleDirection[random];
      possibleDirection.splice(random, 1);
      if(currentLocation.path.length > 0){
        invalidDirection = motionUnit[currentLocation.path[currentLocation.path.length-1]].opposite;
      }
      if(chosenDirection != invalidDirection && !maze.data[currentLocation.distanceFromTop][currentLocation.distanceFromLeft].wall[chosenDirection]){
        var newLocation = exploreInDirection(currentLocation, chosenDirection, "trackAI");
        if (newLocation.status === 'goal') {
          //console.log(newLocation.status)
          minotaur[minotaurId].targetLock = "active";  
          return newLocation.path;
        } else if (newLocation.status === 'valid') {  
          queue.push(newLocation);  
        }
      }
    }
  }
    
  // No valid path found
  if(typeof newLocation == "undefined"){
    var newLocation = { path: [backward], }
    //console.log("wklnflnfkln");
    
  }  
  return newLocation.path;

}

// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by the algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
function locationStatus(currentLocation, direction, newLocation) {
  var originDft = currentLocation.distanceFromTop;
  var originDfl = currentLocation.distanceFromLeft;
    
  var dft = newLocation.distanceFromTop;
  var dfl = newLocation.distanceFromLeft;

  if (location.distanceFromLeft < maze.wall.outerWall ||
      location.distanceFromLeft > (gridX - maze.wall.outerWall) ||
      location.distanceFromTop < maze.wall.outerWall ||
      location.distanceFromTop > (gridY - maze.wall.outerWall)) {
    // location is not on the grid--return false
    return 'invalid';
  } 
  else if (maze.data[dft][dfl].specialStatus === 'goal') {
    return 'goal';
  } 
  else if (maze.data[dft][dfl].specialStatus !== 'none') {
    // location is either an obstacle or has been visited
    return 'blocked';
  }
  else {
    return 'valid';
  }
};

// Explores the grid from the given location in the given
// direction
function exploreInDirection(currentLocation, direction, purpose) {
  var newPath = currentLocation.path.slice();
  if(purpose == "trackAI"){  
    newPath.push(direction);
  }

  var dft = currentLocation.distanceFromTop;
  var dfl = currentLocation.distanceFromLeft;

  dft += motionUnit[direction].moveY;
  dfl += motionUnit[direction].moveX;

  if(purpose == "findPath"){ 
    newPath.push([dft, dfl]);
  }  
    
  var newLocation = {
    distanceFromTop: dft,
    distanceFromLeft: dfl,
    path: newPath,
    status: 'unknown',
  };
  newLocation.status = locationStatus(currentLocation, direction, newLocation);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'valid') {
    maze.data[newLocation.distanceFromTop][newLocation.distanceFromLeft].specialStatus = 'visited';
  }

  return newLocation;
};



//Game Over/Victory Sequence

function gameOver(){
  gameStatus = "gameOver";  
  blackScreen.style.display = "inline";
  gameOverTextBackground.style.display = "inline";
  gameOverText.style.display = "inline";
  restartButton.style.display = "inline";
  restartText.style.display = "inline";
  titleButton.style.display = "inline";  
  titleText.style.display = "inline";
}

function gameVictory(){
  gameStatus = "gameOver";  
  blackScreen.style.display = "inline";
  successTextBackground.style.display = "inline";
  successText.style.display = "inline";
  restartButton.style.display = "inline";
  restartText.style.display = "inline";
  titleButton.style.display = "inline";  
  titleText.style.display = "inline";
}

function eraseGameProgress(){
  for(var i=player[0].data.length-1; i>=0; i--){ player[0].data[i].remove(); player[0].data.pop(); }
  for(var i=player[1].data.length-1; i>=0; i--){ player[1].data[i].remove(); player[1].data.pop(); }
  for(var i=food.length-1; i>=0; i--){ if(food[i]){ food[i].data.remove(); food.pop(); } }
    
  player = [{data: [], maxLength: 4/speed, foodEaten: {status: false, positionX: 0, positionY: 0}, directionX: 1*speed, directionY: 0, futureDirectionX: 1*speed, futureDirectionY: 0, positionX: 0, positionY: gridY-1},
           {data: [], maxLength: 4/speed, foodEaten: {status: false, positionX: 0, positionY: 0}, directionX: -1*speed, directionY: 0, futureDirectionX: -1*speed, futureDirectionY: 0, positionX: gridX-1, positionY: 0},];
    
  
  blackScreen.style.display = "none";
  gameOverTextBackground.style.display = "none";
  gameOverText.style.display = "none";
  successTextBackground.style.display = "none";
  successText.style.display = "none";
  restartButton.style.display = "none";
  restartText.style.display = "none";
  titleButton.style.display = "none";  
  titleText.style.display = "none";
  if(movesToNextFoodText){ movesToNextFoodText.remove(); }  
  if(clippedImage){ clippedImage.remove(); }  
  //gameStatus = false;
}

function restart(){
  eraseGameProgress();
    
  player[0].data[player[0].data.length] = makeImage("Images/Snake/Green Snake.png", player[0].positionX*gridSize, player[0].positionY*gridSize, gridSize, gridSize, 1); 
  createFood();  
  
  if(gameMode == "Portrait"){ 
    player[0].data[player[0].data.length-1].remove();
    player[0].data[player[0].data.length] = makeClipPathRect(player[0].positionX*gridSize, player[0].positionY*gridSize, gridSize, gridSize, 1); 
    clippedImage = makeImage("Images/Portrait Images/" + imageGallery[Math.floor(Math.random()*imageGallery.length)], 0, 0, "100%", "100%", 1);
    clippedImage.setAttribute("class", "clip");
    createFood();  
  }  
    
  if(gameMode == "Co-Op"){
    player[0].data[player[0].data.length-1].remove();
    player[0].data[player[0].data.length] = makeImage("Images/Snake/Red Snake.png", player[0].positionX*gridSize, player[0].positionY*gridSize, gridSize, gridSize, 1);    
    player[1].data[player[1].data.length] = makeImage("Images/Snake/Blue Snake.png", player[1].positionX*gridSize, player[1].positionY*gridSize, gridSize, gridSize, 1); 
    createFood();
  } 
  
  if(gameMode == "Precision"){ movesToNextFoodText = makeText("Move Remaining: " + movesToNextFood, 24, 32, 18, "Special Elite", 1); } 
    
  gameAnimation();
}

function returnToTitleScreen(){
  eraseGameProgress();
  document.body.style.backgroundImage = "url('Images/Background/Black Background.png')"; 
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("modeScreen").style.display = "inline";  
  document.removeEventListener('keydown', updatePlayerInput);
}



//Used W3School
//Draggable Tutorial

dragElement(document.getElementById("tutorialSpace"));
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "Header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function displayTutorialAgain(){
  document.getElementById("tutorialSpace").setAttribute("style", "display: inline; top: 50%; left: 50%; transform: (-50%, -50%);");  
  slide = 1;  
  displayNextSlide();
  document.removeEventListener('keydown', updatePlayerInput);
  gameStatus = "inactive";  
}

function hideTutorialSpace(){
  document.getElementById("tutorialSpace").setAttribute("style", "display: none;");  
  document.addEventListener('keydown', updatePlayerInput); 
  gameStatus = "mainPhase";  
  gameAnimation();
}

var slide=1;
function displayNextSlide(){
  if(slide == 1){
    document.getElementById("tutorialText").innerHTML = "<h3><u>Background:</u></h3><p>&emsp; This game is Snake. A classic from the late 1970s and remastered with Javascript. The purpose of the game is to eat a lot of food and grow big and long! All the while, avoiding the boundaries and cannabalism.</p><button class='nextButton' onclick='displayNextSlide()'>Next: <i class='arrow right'></i></button>"; 
    slide = 2;
  }
  else if(slide ==2){
    if(gameMode == "Portrait"){
      document.getElementById("tutorialText").innerHTML = "<h3><u>Portrait:</u></h3><p>&emsp; This is an experimental game mode. The canvas is an invisible picture and only the player can reveal it! Can you complete the picture? Or will you die trying to do so?</p><button class='nextButton' onclick='displayNextSlide()'>Next: <i class='arrow right'></i></button>";  
      slide = 3;   
    }  
    else if(gameMode == "Precision"){
      document.getElementById("tutorialText").innerHTML = "<h3><u>Precision:</u></h3><p>&emsp; This is an experimental game mode. You have limited moves to get to the next piece of food! Do not mess up or you will starve! Best of luck. Timing is the key.</p><button class='nextButton' onclick='displayNextSlide()'>Next: <i class='arrow right'></i></button>";  
      slide = 3;   
    }  
    else if(gameMode == "Co-Op"){
      document.getElementById("tutorialText").innerHTML = "<h3><u>Co-Op:</u></h3><p>&emsp; This is an experimental game mode. Two players mean double the fun. Play with a friend and see who is the best, but don't kill each other though. Be a good eSportman.</p><button class='nextButton' onclick='displayNextSlide()'>Next: <i class='arrow right'></i></button>";  
      slide = 3;   
    }  
    else{
      document.getElementById("tutorialText").innerHTML = "<h3><u>Players:</u></h3><ul><li>WASD = Move Snake</li><li>Arrow keys = Move Snake</li></ul><h3><u>Miscellaneous:</u></h3><ul><li>R = Restart</li><li>T = Title Screen</li><li>I/H = Reopen Info</li></ul><button class='nextButton' onclick='displayNextSlide()'>Next: <i class='arrow right'></i></button>"; 
      slide = 1;
    }  
  }
  else if(slide == 3){
    document.getElementById("tutorialText").innerHTML = "<h3><u>Players:</u></h3><ul><li>WASD = Move Snake</li><li>Arrow keys = Move Snake</li></ul><h3><u>Miscellaneous:</u></h3><ul><li>R = Restart</li><li>T = Title Screen</li><li>I/H = Reopen Info</li></ul><button class='nextButton' onclick='displayNextSlide()'>Next: <i class='arrow right'></i></button>"; 
    slide = 1;
  }
}



// For Game Over Screen

var blackScreen = makeRect(0, 0, (gridX*gridSize), (gridY*gridSize), "black", 0.6);  
  blackScreen.style.display = "none";
var gameOverTextBackground = makeText("Game Over", 338, 146, 64, "Special Elite", "white", 1);  
  gameOverTextBackground.style.display = "none";
var gameOverText = makeText("Game Over", 339.5, 145, 64, "Special Elite", "black", 1);  
  gameOverText.style.display = "none";
var successTextBackground = makeText("Overflow", 348.5, 146, 64, "Special Elite", "white", 1);  
  successTextBackground.style.display = "none";
var successText = makeText("Overflow", 350, 145, 64, "Special Elite", "black", 1);  
  successText.style.display = "none";
var restartButton = makeRect(447, 210, 106, 20, "white", 1);  
  restartButton.setAttribute("style", "cursor: pointer;");  
  restartButton.addEventListener('click', restart);
  restartButton.setAttribute("stroke", "black");
  restartButton.setAttribute("stroke-width", 2);  
  restartButton.style.display = "none";
var restartText = makeText("Restart", 471, 224.5, 15, "Special Elite", "black", 1);
  restartText.setAttribute("style", "cursor: pointer;");  
  restartText.addEventListener('click', restart); 
  restartText.style.display = "none";
var titleButton = makeRect(447, 250, 106, 20, "white", 1);
  titleButton.setAttribute("style", "cursor: pointer;");  
  titleButton.addEventListener('click', returnToTitleScreen);
  titleButton.setAttribute("stroke", "black");
  titleButton.setAttribute("stroke-width", 2); 
  titleButton.style.display = "none";  
var titleText = makeText("Title Scr.", 463, 264.5, 15, "Special Elite", "black", 1);  
  titleText.setAttribute("style", "cursor: pointer;");  
  titleText.addEventListener('click', returnToTitleScreen); 
  titleText.style.display = "none";  



// DO NOT EDIT CODE BELOW THIS LINE!
function getX(shape) {
  if (shape.hasAttribute("x")) {
    return parseFloat(shape.getAttribute("x"))
  } else {
    return parseFloat(shape.getAttribute("cx"))
  }  
}

function getY(shape) {
  if (shape.hasAttribute("y")) {
    return parseFloat(shape.getAttribute("y"))
  } else {
    return parseFloat(shape.getAttribute("cy"))
  }   
}

function setX(shape, x) {
  if (shape.hasAttribute("x")) {
    shape.setAttribute("x", x)
  } else {
    shape.setAttribute("cx", x)
  } 
}

function setY(shape, y) {
  if (shape.hasAttribute("y")) {
    shape.setAttribute("y", y)
  } else {
    shape.setAttribute("cy", y)
  } 
}

function move(shape, dx, dy) {
  if (shape.hasAttribute("x") && shape.hasAttribute("y")) {
    var x = parseFloat(shape.getAttribute("x"))
    var y = parseFloat(shape.getAttribute("y"))
    shape.setAttribute("x", x + dx)
    shape.setAttribute("y", y + dy)
  } else {
    var cx = parseFloat(shape.getAttribute("cx"))
    var cy = parseFloat(shape.getAttribute("cy"))
    shape.setAttribute("cx", cx + dx)
    shape.setAttribute("cy", cy + dy)
  }
}

function makeCircle(cx, cy, r, fill, opacity) {
  var circle = document.createElementNS(namespace, "circle")
  circle.setAttribute("cx", cx)
  circle.setAttribute("cy", cy)
  circle.setAttribute("r", r)
  circle.setAttribute("fill", fill)
  circle.setAttribute("opacity", opacity)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(circle)
  return circle
}

function makeRect(x, y, width, height, fill, opacity) {
  var rect = document.createElementNS(namespace, "rect")
  rect.setAttribute("x", x)
  rect.setAttribute("y", y)
  rect.setAttribute("width", width)
  rect.setAttribute("height", height)
  rect.setAttribute("fill", fill)
  rect.setAttribute("opacity", opacity)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(rect)
  return rect
}

function makeEllipse(cx, cy, rx, ry, fill, opacity) {
  var ellipse = document.createElementNS(namespace, "ellipse")
  ellipse.setAttribute("cx", cx)
  ellipse.setAttribute("cy", cy)
  ellipse.setAttribute("rx", rx)
  ellipse.setAttribute("ry", ry)
  ellipse.setAttribute("fill", fill)
  ellipse.setAttribute("opacity", opacity)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(ellipse)
  return ellipse
}

function makeLine(x1, y1, x2, y2, stroke, strokeWidth, opacity) {
  var line = document.createElementNS(namespace, "line")
  line.setAttribute("x1", x1)
  line.setAttribute("y1", y1)
  line.setAttribute("x2", x2)
  line.setAttribute("y2", y2)
  line.setAttribute("stroke", stroke)
  line.setAttribute("stroke-width", strokeWidth)
  line.setAttribute("opacity", opacity)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(line)
  return line
}

function makePolyline(points, stroke, strokeWidth, opacity) {
  var polyline = document.createElementNS(namespace, "polyline")
  polyline.setAttribute("points", points)
  polyline.setAttribute("stroke", stroke)
  polyline.setAttribute("stroke-width", strokeWidth)
  polyline.setAttribute("opacity", opacity)
  polyline.setAttribute("fill", "none")
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(polyline)
  return polyline
}

function makePolygon(points, fill, opacity) {
  var polygon = document.createElementNS(namespace, "polygon")
  polygon.setAttribute("points", points)
  polygon.setAttribute("opacity", opacity)
  polygon.setAttribute("fill", fill)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(polygon)
  return polygon
}

function makeText(message, x, y, fontSize, fontFamily, fill, opacity) {
  var text = document.createElementNS(namespace, "text")
  text.innerHTML = message
  text.setAttribute("x", x)
  text.setAttribute("y", y)
  text.setAttribute("font-size", fontSize)
  text.setAttribute("font-family", fontFamily)
  text.setAttribute("fill", fill)
  text.setAttribute("opacity", opacity)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(text)
  return text
}

function makeImage(url, x, y, width, height, opacity) {
  var image = document.createElementNS(namespace, "image")
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url)
  image.setAttribute("x", x)
  image.setAttribute("y", y)
  image.setAttribute("width", width)
  image.setAttribute("height", height)
  image.setAttribute("opacity", opacity)
  
  var canvas = document.getElementById("canvas")
  canvas.appendChild(image)
  return image
}

function collides(rect1, rect2) {
  var centerX = getX(rect1) + parseFloat(rect1.getAttribute("width"))/2
  var centerY = getY(rect1) + parseFloat(rect1.getAttribute("height"))/2
  return (centerX > getX(rect2) && 
          centerX < getX(rect2) + parseFloat(rect2.getAttribute("width")) &&
         centerY > getY(rect2) &&
         centerY < getY(rect2) + parseFloat(rect2.getAttribute("height")))
}
