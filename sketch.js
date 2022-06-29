const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Body = Matter.Body;
const Composites = Matter.Composites;
const Composite = Matter.Composite;

let engine;
let world;
var ground, bridge;
var leftWall, rightWall;
var jointPoint;
var jointLink;
var zombie;
var zombie1, zombie2, zombie3, zombie4, zombieSad;
var zombie1Head;
var breakButton;
var bridgeButton;
var helpButton;
var helpNeed = false;
var stonesButton;
var backgroundImage;
var zombieCollide = false;
var hitText, hitTextImg;

var zombieHealth = 100;
var time = 100;

var stones = [];
var stonesFall = [];

var gameStage = "PLAY";

var bridgeExists = false;

var close;
var closeImg;

function preload() {
  zombie1 = loadImage("./assets/zombie1.png");
  zombie2 = loadImage("./assets/zombie2.png");

  zombie3 = loadImage("./assets/zombie3.png");
  zombie4 = loadImage("./assets/zombie4.png");

  zombieSad = loadImage("./assets/sad_zombie.png");

  zombie1Head = loadImage("./assets/zombie1head.png");

  hitTextImg = loadImage("./assets/Hit.png");

  closeImg = loadImage("./assets/cross.png");

  backgroundImage = loadImage("./assets/background.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight - 4);
  engine = Engine.create();
  world = engine.world;
  frameRate(80);

  ground = new Base(0, height - 10, width * 2, 20);
  leftWall = new Base(100, height - 300, 200, height / 2 + 100);
  rightWall = new Base(width - 100, height - 300, 200, height / 2 + 100);

  bridge = new Bridge(30, { x: 50, y: height / 2 - 140 });
  jointPoint = new Base(width - 250, height / 2 - 100, 40, 20);

  bridgeExists = true;

  Matter.Composite.add(bridge.body, jointPoint);
  jointLink = new Link(bridge, jointPoint);

  hitText = createSprite(width/2,height/2 - 150,100,100);
  hitText.addImage(hitTextImg);
  hitText.scale = 0.5;
  hitText.visible = false;

  for (var i = 0; i <= 8; i++) {
    var x = random(width / 2 - 200, width / 2 + 300);
    var y = random(-100, 100);
    var stone = new Stone(x, y, 80, 80);
    stones.push(stone);
  }

  zombie = createSprite(width / 2, height - 110);
  zombie.addAnimation("lefttoright", zombie1, zombie2, zombie1);
  zombie.addAnimation("righttoleft", zombie3, zombie4, zombie3);
  zombie.addAnimation("zombieEnd",zombie1);
  zombie.addAnimation("zombieSad", zombieSad);
  zombie.scale = 0.1;
  zombie.velocityX = 10;

  breakButton = createButton("");
  breakButton.position(width - 200, height / 2 - 50);
  breakButton.class("breakbutton");

  breakButton.mousePressed(handleButtonPress);

  bridgeButton = createButton("");
  bridgeButton.position(1115, 40);
  bridgeButton.class("bridgebutton");

  helpButton = createButton("");
  helpButton.position(width - 150, 40);
  helpButton.class("helpbutton");

  close = createSprite(width/2 + 260,215,200,200);
  close.addImage(closeImg);
  close.scale = 0.1;
  close.visible = false;


  swal(
    {
      title: `Crush the Zombie!`,
      text: "Try to destroy the zombie by dropping the rocks",
      imageUrl:
        "https://raw.githubusercontent.com/pro-whitehatjr/Project-Template-C30/main/assets/stone.png",
      imageSize: "150x150",
      confirmButtonText: "Start"
    },
  );
}

function draw() {
  background(backgroundImage);
  Engine.update(engine);

  bridge.show();

  frameRate(50);

  if(frameCount % 50 === 0 && zombieHealth > 1){
    time -= 1;
  }

  if(mouseIsPressed && mouseX > width - 150 && mouseX < width - 20 && mouseY > 40 && mouseY < 110){
    helpNeed = true;
  }

  // Zombie Health Bar
  fill(255,255,255);
  rect(190,45,210,35);
  fill(120,228,228);
  rect(195,50,200,25);
  fill(255, 0, 0);
  rect(195,50,zombieHealth * 2,25);

  // Time Health Bar
  fill(255,255,255);
  rect(620,45,210,35);
  fill(120,228,228);
  rect(625,50,200,25);
  fill(52, 134, 235);
  rect(625,50,time * 2,25);

  for (var stone of stones) {
    stone.show();
  }

  if(bridgeExists === false){
    bridgeButton.mousePressed(newBridge);
  }  

  if (zombie.position.x >= width - 300) {
    zombie.velocityX = -10;
    zombie.changeAnimation("righttoleft");
  }

  if (zombie.position.x <= 300) {
    zombie.velocityX = 10;
    zombie.changeAnimation("lefttoright");  
  }

  if(zombieHealth === 0){
    gameOver();
  }

  if(mousePressedOver(close)){
    helpNeed = false;
    close.visible = false;
  }


  if(time === 0){
    swal(
      {
        title: `Oh-No!!!`,
        text: "Your ran out of time!!",
        imageUrl:
          "https://raw.githubusercontent.com/pro-whitehatjr/Project-Template-C30/main/assets/zombie1.png",
        imageSize: "150x150",
        confirmButtonText: "Play Again"
      },
      function(isConfirm) {
        if (isConfirm) {
          location.reload();
        }
      }
    );
  }

  image(zombie1Head,130,37,50,50);

  if(helpNeed === true){
    help();
  }

  drawSprites();

  fill(0,0,0);
  textSize(20);
  text("Zombie Health", 235, 30);
  text("Time", 700, 30);
  text("New Bridge", 1100, 30);
}

function handleButtonPress() {
  zombiePause();
  zombie.changeAnimation("zombieEnd");

   jointLink.dettach();
  setTimeout(() => {
    bridge.break();
  }, 1500); 

  setTimeout(() =>{
    for(var stone of stones){
      stonesFall.push(stone.body.position.x);
    }
  
    zombieHit();
  }, 500);
}

function zombieHit(){
  for(var i = 0; i < stonesFall.length; i++){
    if((zombie.x - stonesFall[i]) > -20 && (zombie.x - stonesFall[i]) < 20){
      zombieCollide = true;
      zombieHealth -= 20;
    }
  }

  setTimeout(() =>{
    for(var stone of stones){
      World.remove(world,stone.body);
    }
    stones = [];
    stonesFall = [];
    bridgeExists = false;
  }, 2000)
}

function gameOver(){
  zombie.changeAnimation("zombieSad");
  zombie.velocityX = 0;
  zombieHealth = -1;

  setTimeout(() => {
    swal(
      {
        title: `Congrats!!!`,
        text: "You have destroyed the Zombie!!",
        imageUrl:
          "https://raw.githubusercontent.com/pro-whitehatjr/Project-Template-C30/main/assets/stone.png",
        imageSize: "150x150",
        confirmButtonText: "Play Again"
      },
      function(isConfirm) {
        if (isConfirm) {
          location.reload();
        }
      }
    );
  }, 1500)
}

function newBridge(){
  bridge = new Bridge(30, { x: 50, y: height / 2 - 140 });
  birdgeExists = true;

  Matter.Composite.add(bridge.body, jointPoint);
  jointLink = new Link(bridge, jointPoint);

  for (var i = 0; i <= 8; i++) {
    var x = random(width / 2 - 200, width / 2 + 300);
    var y = random(-100, 100);
    var stone = new Stone(x, y, 80, 80);
    stones.push(stone);
  }
}

function zombiePause(){
  zombie.velocityX = 0;
  hitText.visible = true;
  
  if(zombieHealth > 0){
  setTimeout(() => {
    zombie.changeAnimation("lefttoright");
    zombie.velocityX = 10;
    hitText.visible = false;
  },3000)
  }
}

function keyPressed(){
  if(keyCode === 32){
    help();
    console.log("Hello")
  }
}

function help(){
  fill(255,255,255);
  rect(width/2- 300,height/2 - 250,600,400);
  close.visible = true;
  fill(0,0,0);
  textSize(40);
  text("Help", width/2 - 50,height/2 - 200);
  textSize(20);
  text("1. Build a bridge using the New Bridge button",width/2 - 250,300);
  text("2. Now using the cut button try to break the bridge and drop the stones on the zombie", width/2 - 250,340, 550,330);
  text("3. If you manage to hit the zombie the zombies health will decrease", width/2 - 250,420,550,390);
  text("4. Keep building bridges to try and decrease the zombies health. Try to destroy the zombie before the time runs out!", width/2 - 250, 500,550,440);
}
