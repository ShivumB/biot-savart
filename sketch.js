var wires = [];
var pointList = [];

var batteries = [];
var batterySprite;

var keyReset = true;

var sel = 0;

var field = 0;

var t = 0;

function preload() {
  batterySprite = loadImage("battery.png");
}

function setup() {
  createCanvas(windowWidth,windowHeight);

  sel = 0;
}

function draw() {

  background(237, 181, 37);

  if(keyReset && key == "") {
    wires.splice(wires.length - 1, 1);
    keyReset = false;
  }

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

  strokeWeight(2);
  for(let i = 0; i < wires.length; i++) {
    if(wires[i][1]) stroke(255,0,0);
    else stroke(0);

    for(let j = 1; j < wires[i][0].length; j++) {
      line(wires[i][0][j-1][0], wires[i][0][j-1][1], wires[i][0][j][0], wires[i][0][j][1]);
    }
  }

  noStroke();
  for(let i = 0; i < wires.length; i++) {

    for(let j = 1; j < wires[i][0].length; j++) {
      if(wires[i][1]) {
        fill(255,0,0);
        ellipse(wires[i][0][0][0], wires[i][0][0][1], 5, 5);
        ellipse(wires[i][0][wires[i][0].length - 1][0], wires[i][0][wires[i][0].length - 1][1], 5, 5);

        if(wires[i][2] == 1) {
          ellipse(wires[i][0][j-1][0] + t * (wires[i][0][j][0] - wires[i][0][j-1][0]),
          wires[i][0][j-1][1] + t * (wires[i][0][j][1] - wires[i][0][j-1][1]), 5, 5);
        } else {
          ellipse(wires[i][0][j][0] + t * (wires[i][0][j-1][0] - wires[i][0][j][0]),
          wires[i][0][j][1] + t * (wires[i][0][j-1][1] - wires[i][0][j][1]), 5, 5);
        }
      } else {
        fill(0);
        ellipse(wires[i][0][0][0], wires[i][0][0][1], 5, 5);
        ellipse(wires[i][0][j][0], wires[i][0][j][1], 5, 5);
      }
    }
  }
  t += 0.05;
  t %= 1;

  stroke(255);
  fill(255);
  for(let i = 1; i < pointList.length; i++) {
    line(pointList[i-1][0], pointList[i-1][1], pointList[i][0], pointList[i][1]);
    ellipse(pointList[i][0], pointList[i][1], 5, 5);
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

    if(sel == 1) {
      batteries.push(new Battery(mouseX - 37/2, mouseY - 69/2));

      checkCircuits(batteries, wires);
      field = calcBiotSavart(wires);
    }

  }
}

function mouseDragged() {
  if(sel == 0 && mouseX > width/16) {
    pointList.push([mouseX, mouseY]);
  }
}

function mouseReleased() {

  if(sel == 0 && pointList.length > 0) {
    wires.push([pointList, false, 1]);
    pointList = [];

    checkCircuits(batteries, wires);
    field = calcBiotSavart(wires);
  }
}

function calcBiotSavart(wires) {

  let current = 1;
  let field = 0;

  let deltaL = [];
  let deltaR = [];
  let crossProd = 0;
  let rMag = 0;
  
  for(let i = 0; i < wires.length; i++) {

    //SIGMA of delta B
    for(let j = 1; j < wires[i][0].length; j++) {

      if(!wires[i][1]) continue;

      deltaL = [wires[i][0][j][0] - wires[i][0][j-1][0], wires[i][0][j][1] - wires[i][0][j-1][1]];
      deltaR = [width/2 - wires[i][0][j][0], height/2 - wires[i][0][j][1]];

      rMag = deltaR[0] * deltaR[0] + deltaR[1]*deltaR[1];

      crossProd = deltaL[0] * deltaR[1] - deltaL[1] * deltaR[0];
      crossProd /= Math.sqrt(rMag)

      field += crossProd / (rMag) * wires[i][1];
    }

  }

  //divides by myu * I / 4PI, the 4PI cancels out, so 10^-7 * I
  return field * 0.0000001 * current;

}

class Battery {
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    image(batterySprite, this.x, this.y, 37, 69);
  }
}

function keyPressed() {
  keyReset = true;
}

function checkCircuits(batteries, wires) {

  //set all wires false until they r checked
  for(let i = 0; i < wires.length; i++) wires[i][1] = false;

  for(let i = 0; i < batteries.length; i++) {

    for(let j = 0; j < wires.length; j++) {

      //starts at positive terminal, ends at negative
      if(wires[j][0][0][0] > batteries[i].x && wires[j][0][0][0] < batteries[i].x + 37
        && wires[j][0][0][1] > batteries[i].y && wires[j][0][0][1] < batteries[i].y + 30
      && wires[j][0][wires[j][0].length - 1][0] > batteries[i].x
      && wires[j][0][wires[j][0].length - 1][0] < batteries[i].x + 37
      && wires[j][0][wires[j][0].length - 1][1] > batteries[i].y + 30
      && wires[j][0][wires[j][0].length - 1][1] < batteries[i].y + 69) {

        wires[j][1] = true;
        wires[j][2] = 1;

      }

      //starts at negative terminal, ends at positive
      else if(wires[j][0][0][0] > batteries[i].x && wires[j][0][0][0] < batteries[i].x + 37
        && wires[j][0][0][1] > batteries[i].y + 30 && wires[j][0][0][1] < batteries[i].y + 69
      && wires[j][0][wires[j][0].length - 1][0] > batteries[i].x
      && wires[j][0][wires[j][0].length - 1][0] < batteries[i].x + 37
      && wires[j][0][wires[j][0].length - 1][1] > batteries[i].y
      && wires[j][0][wires[j][0].length - 1][1] < batteries[i].y + 30) {

        wires[j][1] = true;
        wires[j][2] = -1;
      }

    }

  }

}