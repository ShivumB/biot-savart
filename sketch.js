var nodes = [];

var batteries = [];
var batterySprite;

var sel = 0;

var field = 0;

function preload() {
  batterySprite = loadImage("battery.png");
}

function calcBiotSavart(nodes) {
  let field = 0;
  
  for(let i = 0; i < nodes.length; i++) {    
    field += (nodes[i].recPos[0] * nodes[i].rHat[1] - nodes[i].recPos[1] * nodes[i].rHat[0]) * nodes[i].coeff;
  }
    
  return field; 
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
  
  field = calcBiotSavart(nodes);
  //convert to cm
  field *= 10000;
  textAlign(CENTER, TOP);
  textSize(25);
  fill(0);
  stroke(0);
  strokeWeight(0.5);
  text(field.toExponential(2) + "T", width/2, height/2 + 10);

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
    this.curr = 1;
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
    
    
    
    this.rHat = [width/2 - x, height/2 - y];
    let rMag = this.rHat[0] * this.rHat[0] + this.rHat[1] * this.rHat[1];
    this.rHat[0] /= Math.sqrt(rMag);
    this.rHat[1] /= Math.sqrt(rMag);
    
    this.coeff = 0.0000001 / rMag;
    
    this.curr = 0;
    
    this.recPos = [0, 0];
    
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
       
    this.recPos[0] = 0;
    this.recPos[1] = 0;
    
    for(let i = 0; i < batteries.length; i++) {
      //receive from positive terminal
      if(this.x > batteries[i].x && this.x < batteries[i].x + 37 && this.y > batteries[i].y && this.y < batteries[i].y + 30) {
        this.full += batteries[i].curr;
      }
    }

    //donate to negative terminal
    for(let i = 0; i < batteries.length; i++) {
      if(this.x > batteries[i].x && this.x < batteries[i].x + 37 && this.y > batteries[i].y + 30 && this.y < batteries[i].y + 69) {
        
        this.full = Math.floor(this.full/2);
        
        this.recPos[0] = batteries[i].x + 18 - this.x;
        this.recPos[1] = batteries[i].y + 49 - this.y;
        return;
      }
    }
    
    if(this.full <= 0 || this.nodes.length == 0) return;
    
    //get the index of the lowest electron filled point
    let mindex = 0;
    for(let i = 0; i < this.nodes.length; i++) {
      if(this.nodes[i].full <= this.nodes[mindex].full) mindex = i;
    }
    
    if(this.full <= this.nodes[mindex].full + 1) return;
    
    
    const donateAmount = Math.floor(this.full - this.nodes[mindex].full/2);
    
    this.nodes[mindex].full += donateAmount;
    
    this.recPos[0] = this.nodes[mindex].x - this.x;
    this.recPos[1] = this.nodes[mindex].y - this.y;
    
    
    this.full -= donateAmount; 
  }
  
}

