var colorBlock = document.getElementById('color-block');
var ctx = colorBlock.getContext('2d');
var width = colorBlock.width;
var height = colorBlock.height;
var colorLabel = document.getElementById('color-label');
var colorInput = document.getElementById('color-input');
var drag = false;
var usedColors = [];

// Grab the latest languages.yml file and pull out all the used colours
var httpRequest = new XMLHttpRequest()
httpRequest.open("GET", "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml");
httpRequest.onload = function() {
  doc = jsyaml.safeLoad(this.response);
  for(lang in doc) {
    if (doc[lang].color) {
      usedColors.push(doc[lang].color.toLowerCase());
    }
  }
}
httpRequest.send();

ctx.rect(0, 0, width, height);
fillGradient();

function fillGradient() {
  var gradient = ctx.createLinearGradient(0, 0, width, 0);
  // Create colour gradient
  gradient.addColorStop(0,    "rgb(255,   0,   0)");
  gradient.addColorStop(0.15, "rgb(255,   0, 255)");
  gradient.addColorStop(0.33, "rgb(0,     0, 255)");
  gradient.addColorStop(0.49, "rgb(0,   255, 255)");
  gradient.addColorStop(0.67, "rgb(0,   255,   0)");
  gradient.addColorStop(0.84, "rgb(255, 255,   0)");
  gradient.addColorStop(1,    "rgb(255,   0,   0)");
  // Apply gradient to canvas
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  // Create semi-transparent gradient white -> trans -> black
  gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
  gradient.addColorStop(1,   "rgba(0,     0,   0, 1)");
  // Apply gradient to canvas
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// TODO: Implement cursor movement for microscopic tweaking

function mousedown(e) {
  drag = true;
  changeColor(e);
}

function mousemove(e) {
  if (drag) {
    changeColor(e);
  }
}

function mouseup() {
  drag = false;
}

function keyup() {
  if ( this.value.length < 7 ) return;
  changeColor(this.value);
}

function rgbToHex(color) {
  return "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
}

function changeColor(e) {
  if (typeof e === "string") {
    hexColor = e;
  } else {
    x = e.offsetX;
    y = e.offsetY;
    imageData = ctx.getImageData(x, y, 1, 1).data;
    hexColor = rgbToHex(imageData);
  }
  colorInput.value = hexColor;
  checkColour(hexColor);
}

function checkColour(hexColor) {
  if ( usedColors.indexOf(hexColor) >= 0 || proximityTest(hexColor)){
    colorLabel.style.backgroundColor = "#ffffff";
    colorLabel.innerHTML = hexColor + " is not available";
  } else {
    colorLabel.style.backgroundColor = hexColor;
    colorLabel.innerHTML = "";
  }
}

// TODO: also look at https://github.com/zschuessler/DeltaE
function proximityTest(color) {
  for (c of usedColors) {
    [L1, A1, B1] = Colour.HEX2LAB(color, 1);
    [L2, A2, B2] = Colour.HEX2LAB(c, 2);
    deltaE = Colour.DeltaE00(L1, A1, B1, L2, A2, B2);
    if ((deltaE / 100 ) < 0.05 ) {
      return true;
    }
  }
}

colorBlock.addEventListener("mousedown", mousedown, false);
colorBlock.addEventListener("mouseup", mouseup, false);
colorBlock.addEventListener("mousemove", mousemove, false);
colorInput.addEventListener("keyup", keyup, false);