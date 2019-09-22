// The 'style' var holds styling for each suggestion item.
// CSS elements are assigned to 'style' innerHTML.
var style = document.createElement("style");
// Then the style tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(style);

window.addEventListener("load", function() {
  var viewportHeight = window.innerHeight;
  // Occupied space is the total vertical space taken up by elements and their
  // heights/margins. This does not include the settings options wrapper element.
  var occupiedSpace = 60 + 20 + 20;

  style.innerHTML +=
  "#settings--options {" +
    "height: " + (viewportHeight - occupiedSpace) + "px;" +
  "}";
});

document.getElementById("nav--settings").addEventListener("click", function() {
  document.getElementById("settings").className = "";

  var recent = document.getElementById("recent");
  // If the recent sidebar is open, then close it.
  if (recent.className != "collapsed")
  {
    recent.className = "collapsed";
  }
});

document.getElementById("slider").addEventListener("click", function() {
	var sliderToggle = document.getElementById("ball");
  if (sliderToggle.className == "")
  {
  	sliderToggle.className = "off";
  }
  else
  {
  	sliderToggle.className = "";
  }
});

document.getElementById("settings--close").addEventListener("click", function() {
  document.getElementById("settings").className = "collapsed";
});

window.addEventListener("resize", function() {
  var viewportHeight = window.innerHeight;
  // Occupied space is the total vertical space taken up by elements and their
  // heights/margins. This does not include the settings options wrapper element.
  var occupiedSpace = 60 + 20 + 20;

  style.innerHTML +=
  "#settings--options {" +
    "height: " + (viewportHeight - occupiedSpace) + "px;" +
  "}";
});
