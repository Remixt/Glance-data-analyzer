"use strict"; // strict mode syntax

//Any file that requires jQuery should be
//placed within this annon function
require(["libs/jquery/jquery-1.11.2.js"],function(jquery) {
  require(["libs/jquery/jquery-ui.js"]);
  require(["libs/SlickGrid/lib/jquery.event.drag-2.2.js"],function(drag) {
    require(["libs/SlickGrid/slick.core.js"], function(core) {
      require(["libs/SlickGrid/slick.editors.js"]);
      require(["libs/SlickGrid/lib/firebugx.js"]);
      require(["javascript/slickTable.js"]);
      require(["libs/SlickGrid/slick.grid.js"]);
    });
  });
});


require(["libs/PapaParse/papaparse.min.js"]);
require(["libs/chartjs/Chart.js"]);

require(["javascript/files.js"], function(print){
  loadListener();
  createListener();
});

require(["javascript/chart.js"]);
require(["javascript/overlay.js"]);
require(["javascript/arrayInfo.js"]);
require(["javascript/arrayCollection.js"]);
require(["javascript/global.js"]);
require(["javascript/summary.js"]);
require(["javascript/prompts.js"]);
require(["javascript/printer.js"]);

var player;
var overlay;
var summary;
var chart;
var collection;
var type = null;
var lineColors = [];
var slickTable;
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor')>0;
// initial data load
// (this is called after fileOpen from files.js)
var loadData = function (data) {
    document.getElementById('myChart').style.display = 'inline';
    document.getElementById('start').style.display = 'none';
    document.querySelector('#overlay').setAttribute('style', '');
    document.querySelector('#slickTable').innerHTML = '';
    slickTable = loadSlickTable(data.data);
    document.getElementById('tableCount').innerHTML = "[ Total Row: " + (data.data.length - 1) + " ] [ Total Column: " + (data.data[0].length - 1) + " ]";
    document.getElementById('remInstruction').innerHTML = "*To remove specific row or column: delete the contents in the chosen label cells."
    chart = loadChart(data.data, type);
    if(chart && type === "bar"){
      convertPointsToBars();
      if(!document.getElementById("barGraphAudioOptions")){
        var newddm = document.createElement("select");
        newddm.setAttribute("id","barGraphAudioOptions");
        newddm.setAttribute("class","drop-down");
        var option = document.createElement("option");
        option.setAttribute("value","0");
        option.innerHTML = "Normal";
        newddm.appendChild(option);
        option = document.createElement("option");
        option.setAttribute("value","1");
        option.innerHTML = "Play by column";
        newddm.appendChild(option);
        if(!isSafari){
          option = document.createElement("option");
          option.setAttribute("value","2");
          option.innerHTML = "Play columns as chords";
          newddm.appendChild(option);
        }
        var label = document.createElement("label");
        label.innerHTML = "Play mode ";
        label.setAttribute("id","playModeLabel");
        document.getElementById("audioSpanSec").appendChild(label);
        document.getElementById("audioSpanSec").appendChild(newddm);
        newddm.setAttribute("onchange", "makeColSelector()");
      }
    }
    else{
      if(document.getElementById('barGraphAudioOptions')){
        var c = document.getElementById('barGraphAudioOptions');
        var p =  c.parentNode;
        p.removeChild(c);
        var c = document.getElementById('playModeLabel');
        p.removeChild(c);
        if(document.getElementById("colSelector")){
          var c = document.getElementById('colSelector');
          var p =  c.parentNode;
          p.removeChild(c);
          var c = document.getElementById("colNumLabel");
          p.removeChild(c);
        }
      }
      convertPointsToScatter();

    }
    if(Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
      player = new WaveForm("sine");
    else
      player = new Instrument(1);
    overlay = new Overlay(data, type);
    overlay.updateSize(chart);
    collection = new ArrayCollection(data.data);
    player.setCollection(collection.collection);
    summary = new DataSummary(collection);
    summary.dataSummary();
    linkSlickTable(chart, player, overlay, summary);
    for(var i = 1; i < 128; i ++){
      var newElem = document.createElement("option");
      newElem.value = i;
      newElem.innerHTML = instruments[i];
      document.getElementById('instrumentDropdown').appendChild(newElem);
    }
    document.getElementById("content").style.position = "inherit"; //overides corresponding style in index.html that hides the content tag
    document.getElementById("content").style.top = ""; // meant to leave it blank: to overide corresponding style in index.html that hides the content tag
    document.getElementById("content").style.left = ""; // meant to leave it blank: to overide corresponding style in index.html that hides the content tag
    document.getElementById('typeSelBody').style.display = 'block';
    document.getElementById('plot-header').style.display = 'inline';
    document.getElementById('tableControls').style.display = 'block';
    document.getElementById('summaryBox').style.display = 'block';
    fixSlick();
}


// The play button
var playStopAudioButton = function () {
  //Change the speed of the audio based on speed input.
  var bpm = 80 + 20 * document.getElementById('bpm').value;
  player.setBpm(bpm);
  //DO NOT CHANGE/DELETE: Fixes audio issue involving slider
  if(overlay.slider[0] === 0 && overlay.slider[1] === 0){
   overlay.slider[1] = chart.datasets[0].length;
  }
    if(player.buffer === undefined){
      player.changeInstrument(document.getElementById("instrumentDropdown").value);
      setTimeout(function() {}, 2000);
    }
    if(document.getElementById("barGraphAudioOptions")=== null){
      var mode = null;
    }
    else{
      var mode = document.getElementById("barGraphAudioOptions").selectedIndex;
    }
    player.playToggle(document.getElementById("lineDropdown").value - 1, overlay.slider[0], overlay.slider[1],mode);
}

// Opens the color editor
var openColorEditor = function () {
    var editor = document.getElementById('colors');
    editor.style.display = editor.style.display == 'inline' ? 'none' : 'block';
}

var focusElement = function(elementClass) {
  document.getElementsByClassName(elementClass)[0].style.backgroundColor = "#000";
  document.getElementsByClassName(elementClass)[0].style.color = "#FFF";
}

var blurElement = function(elementClass) {
  document.getElementsByClassName(elementClass)[0].style.backgroundColor = "#FFF";
  document.getElementsByClassName(elementClass)[0].style.color = "#000";
}

var makeColSelector = function(){
  if(document.getElementById("barGraphAudioOptions").selectedIndex === 1 && !document.getElementById("colSelector")){
    var selector = document.createElement("select");
    selector.setAttribute("id", "colSelector");
    selector.setAttribute("class","drop-down");
    for(var i = 0; i < chart.datasets[0].bars.length; i ++){
      var option = document.createElement("option");
      option.setAttribute("value", i);
      option.innerHTML = chart.datasets[0].bars[i].label;
      selector.appendChild(option);
    }
    var label = document.createElement("label");
    label.setAttribute("id","colNumLabel");
    label.innerHTML = "Column number ";
    document.getElementById("audioSpanSec").appendChild(label);  
    document.getElementById("audioSpanSec").appendChild(selector);
  }
  else if(document.getElementById("colSelector")){
    var c = document.getElementById('colSelector');
    var p =  c.parentNode;
    p.removeChild(c);
    var c = document.getElementById("colNumLabel");
    p.removeChild(c);
  }
}
