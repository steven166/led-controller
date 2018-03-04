var childProcess = require("child_process");
var express = require("express");
var bodyParser = require('body-parser')
var path = require("path");
var Gpio;
try{
  Gpio = require('pigpio').Gpio;
}catch(e){}

var FADE_RATE = 50;
var PORT_RED = 17;
var PORT_GREEN = 22;
var PORT_BLUE = 24;
var gpios = {};
if(Gpio) {
  gpios[PORT_RED] = new Gpio(PORT_RED, {mode: Gpio.OUTPUT});
  gpios[PORT_GREEN] = new Gpio(PORT_GREEN, {mode: Gpio.OUTPUT});
  gpios[PORT_BLUE] = new Gpio(PORT_BLUE, {mode: Gpio.OUTPUT});
}
var currentValues = {};
var fades = {};
var targetColors = {};

init(function () {
  // var animations = [
  //   {
  //     time:
  //   }
  // ];
  //
  //
  // var annimation = function () {
  //   fadeColor(255,0,0, 5000);
  //   setTimeout(function () {
  //     fadeColor(0,255,0, 5000);
  //   }, 5000);
  //   setTimeout(function () {
  //     fadeColor(0,0,255, 5000);
  //   }, 10000);
  //   setTimeout(function () {
  //     fadeColor(255,255,255, 4000);
  //   }, 15000);
  // };
  // setInterval(annimation, 20000);
  // annimation();
});

function init(callback) {
  var app = express();
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, '/public')));
  app.get("/api/v1/colors", function(req, res, next) {
    res.json({
      red: targetColors.red,
      green: targetColors.green,
      blue: targetColors.blue,
      currentRed: currentValues[PORT_RED],
      currentGreen: currentValues[PORT_GREEN],
      currentBlue: currentValues[PORT_BLUE]
    });
  });
  app.post("/api/v1/colors", function(req, res, next) {
    fadeColor(req.body.red, req.body.green, req.body.blue, req.body.period);
    res.json(targetColors);
  });
  app.listen(3000, function(){
    console.log('Example app listening on port 3000!');
  });
  callback();
}

function setPort(port, value, callback) {
  currentValues[port] = value;
  value = parseInt(value);
  if(value < 0){
    value = 0;
  }
  if(value > 255){
    value = 255;
  }
  if(gpios[port]){
    gpios[port].pwmWrite(parseInt(value));
  }
  if(callback) {
    callback();
  }
}

function fade(port, value, period) {
  var currentValue = currentValues[port] || 0;
  var steps = (period / FADE_RATE) - 1;
  var stepValue = (value - currentValue) / steps;
  console.info("from " + currentValue + " to " + value + " in " + period + "ms with " + steps + " steps " + stepValue);
  var index = 0;
  if (fades[port]) {
    clearInterval(fades[port]);
  }
  fades[port] = setInterval(function () {
    if (index >= steps) {
      setPort(port, value);
      clearInterval(fades[port]);
    } else {
      currentValue += stepValue;
      setPort(port, currentValue);
      index++;
    }
  }, FADE_RATE);
}

function fadeColor(rValue, gValue, bValue, period) {
  console.info("set color: " + rValue + "," + gValue + "," + bValue + " in " + period);
  targetColors = {
    red: rValue,
    green: gValue,
    blue: bValue
  };
  fade(PORT_RED, rValue, period);
  fade(PORT_GREEN, gValue, period);
  fade(PORT_BLUE, bValue, period);
}