var nodes = [];

var batteries = [];
var batterySprite;

var sel = 0;

var field = 0;

function preload() {
  batterySprite = loadImage("battery.png");
}

function setup() {
  createCanvas(windowWidth,windowHeight);

  sel = 0;
}

function draw() {

  background(237, 181, 37);

  if(field < 0) {
    fill(0);
    noStroke();
    ellipse(width/2, height/2, 10, 10);
  } else {
    stroke(0);
    strokeWeight(2);
    line(width/2 - 5, height/2 - 5, width/2 + 5, height/2 + 5);
    line(width/2 + 5, height/2 - 5, width/2 - 5, height/2 + 5);
  }


  for(let i = 0; i < batteries.length; i++)
    batteries[i].show();
  
  for(let i = 0; i < nodes.length; i++) {
    nodes[i].update(batteries);
    nodes[i].show();
  }
  
  textAlign(CENTER, TOP);
  textSize(25);
  fill(0);
  stroke(0);
  strokeWeight(0.5);
  text(field.toPrecision(3) + "T", width/2, height/2 + 10);

  stroke(0);
  strokeWeight(3);
  for(let i = 0; i < height; i ++) {
    if(sel == i) fill(255);
    else fill(120,120,0);
    rect(0, i * height/6, width/16, height/6);
  }

  image(batterySprite, 20, 10 + height/6, 37, 69);

  fill(0);
  stroke(0);
  strokeWeight(0.5);
  text("wire", 40, 40);

}

function mouseClicked() {
  if(mouseX < width/16) {
    sel = Math.floor(mouseY / (height/6));
  } else {
    if(sel == 0) {
      nodes.push(new Node(mouseX, mouseY));
      
      for(let i = 0; i < nodes.length - 1; i++) {
        nodes[i].checkNode(nodes[nodes.length - 1]);
        nodes[nodes.length - 1].checkNode(nodes[i]);
      }

    } else if(sel == 1) {
      batteries.push(new Battery(mouseX - 37/2, mouseY - 69/2));
    }

  }
}

function mouseDragged() {
  if(sel == 0) {
    nodes.push(new Node(mouseX, mouseY));
      
    for(let i = 0; i < nodes.length - 1; i++) {
      nodes[i].checkNode(nodes[nodes.length - 1]);
      nodes[nodes.length - 1].checkNode(nodes[i]);
    }
  }
}

class Battery {
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    noFill();
    stroke(0);
    strokeWeight(2);
    image(batterySprite, this.x, this.y, 37, 69);
  }
}

class Node {
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    this.t = 0;
    
    this.full = 0;
    
    this.nodes = [];
  }
  
  checkNode(node) {
    
    if((node.x - this.x) * (node.x - this.x) + (node.y - this.y) * (node.y - this.y) < 400) {
      this.nodes.push(node);
    }
  }
  
  show() {
    noStroke();
    
    if(this.full <= 0) fill(255, 0, 0, 100);
    else fill (0, 255, 255, 100);
    ellipse(this.x, this.y, 20, 20);
    
    if(this.full <= 0) fill(0);
    else fill(0, 0, 255);
    ellipse(this.x, this.y, 5, 5);
  }
  
  update(batteries) {
    
    this.t++;
    this.t %= 10;
    if(this.t != 0) return;
       
    for(let i = 0; i < batteries.length; i++) {
      //receive from positive terminal
      if(this.x > batteries[i].x && this.x < batteries[i].x + 37 && this.y > batteries[i].y && this.y < batteries[i].y + 30) {
        this.full++;
      }
    }

    //donate to negative terminal
    for(let i = 0; i < batteries.length; i++) {
      if(this.x > batteries[i].x && this.x < batteries[i].x + 37 && this.y > batteries[i].y + 30 && this.y < batteries[i].y + 69) {
        this.full = Math.max(0, this.full - 1);
      }
    }
    
    if(this.full <= 0 || this.nodes.length == 0) return;
    
    //get the index of the lowest electron filled point
    let mindex = 0;
    for(let i = 0; i < this.nodes.length; i++) {
      if(this.nodes[i].full <= this.nodes[mindex].full) mindex = i;
    }

    this.nodes[mindex].full ++;
    this.full --; 
  }
  
}
