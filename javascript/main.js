"use strict"; // strict mode syntax
require(["libs/jquery/jquery-1.11.2.js"]);
require(["libs/jquery/jquery-ui.js"]);
require(["libs/handsontable/handsontable.full.min.js"]);
require(["libs/PapaParse/papaparse.min.js"]);
require(["libs/chartjs/Chart.js"]);
require(["libs/jsfx/audio.js"], function(audio){
  require(["libs/jsfx/jsfx.js"]);
  require(["libs/jsfx/jsfxlib.js"]);
});
require(["javascript/files.js"], function(print){
  loadListener();
});
require(["javascript/slickTable.js"]);
require(["javascript/chart.js"]);
require(["javascript/overlay.js"]);
require(["javascript/arrayInfo.js"]);
require(["javascript/audioPlayer.js"]);
require(["javascript/arrayCollection.js"]);
require(["javascript/global.js"]);

var player;
var overlay;
// initial data load
// (this is called after fileOpen from files.js)
var loadData = function(data){
  document.querySelector('#overlay').setAttribute('style','');
  document.querySelector('#slickTable').innerHTML = '';
  var slickTable = loadSlickTable(data.data);
  var chart = loadChart(data.data);
  player = new AudioPlayer();
  overlay = new Overlay(data);
  overlay.updateSize(chart);
  linkSlickTable(chart,player,overlay);
  var collection = new ArrayCollection(data.data);
  player.setCollection(collection.collection);
  document.getElementById('color-expand').style.display = 'block';
  document.getElementById('data-summary').style.display = 'block';

  var summaryDiv = document.getElementById("tblSummary");
  for (var i = 0; i < collection.collection.length; i++) {
      summaryDiv.innerHTML += " Line " + (i + 1) + " : Max: " + collection.collection[i].trend.max + 
        " Min: " + collection.collection[i].trend.min + 
        " Average: " + collection.collection[i].trend.avg + "</br>";
  }
  summaryDiv.innerHTML += "Total Data Summary : Max: " + collection.max + 
    " Min: " + collection.min + " Average: " + calcCollectionAvg(collection); 

}

// The play button
var playStopAudioButton = function(){
  player.playToggle(document.getElementById("lineDropdown").value - 1, overlay.slider[0], overlay.slider[1]);
}

// Opens the color editor
var openColorEditor = function(){
  var editor = document.getElementById('color-editor');
  editor.style.display = editor.style.display == 'inline' ? 'none' : 'block';
}

var calcCollectionAvg = function(collection) {
  var collTotal = 0;

  for (var i = 0; i < collection.collection.length; i++){
    collTotal += collection.collection[i].trend.sum;
  }

  var totalDataPoints = 0;
  for (var i = 0; i < collection.collection.length; i++) {
      totalDataPoints += collection.collection[i].array.length;
  }

  var average = Math.round(100 * collTotal/totalDataPoints)/100;
  return average;
 }
