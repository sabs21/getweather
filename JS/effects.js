// CSS elements are assigned to 'loadStyle' innerHTML.
var loadStyle = document.createElement("style");
// Then the loadStyle tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(loadStyle);
// From here, we may begin editing the css of the document.

// The same process as above is done for the rest of the animations.
var suggestStyle = document.createElement("style");
ref.appendChild(suggestStyle);
// Keeps track of whether the suggestions are visible or not.
var suggestVisible = false;

// Using loadStyle, we will tinker with animations that play on page load.
window.addEventListener("load", function() {
  loadStyle.innerHTML =
    "#header--title {" +
      "opacity: 1;" +
    "}\n";

  setTimeout(function() {
    // After the first innerHTML edit, the innerHTML must be concatenated.
    // If we don't concatenate, then we will lose previously defined styling.
    loadStyle.innerHTML +=
      "#header--title-get {" +
        "background-position: -119px 0px;" +
      "}\n" +
      "#header--title-weather {" +
        "background-position: -239px 0px;" +
      "}\n" +
      "#header--puddle-right-line, #header--puddle-left-line {" +
        "opacity: 1;" +
      "}\n";
  }, 500);

  setTimeout(function() {
    loadStyle.innerHTML +=
      "#header--title-seperate {" +
        "height: 2px;" +
        "margin-top: 160px;" +
      "}\n";
  }, 1000);

  setTimeout(function() {
    loadStyle.innerHTML +=
      "#header--title-seperate {" +
        "visibility: hidden" +
      "}\n" +
      "#header--puddle-right-line {" +
        "width: 346px;" +
      "}\n" +
      "#header--puddle-left-line {" +
        "width: 154px;" +
      "}\n" +
      "#header--title-get {" +
        "margin-right: -10px;" +
      "}\n" +
      "#header--title-weather {" +
        "margin-left: -10px;" +
      "}\n";
  }, 1600);

  setTimeout(function() {
    loadStyle.innerHTML +=
      "#header--weather {" +
        "opacity: 1;" +
      "}\n";
  }, 2400)
});

/*var suggestion = document.getElementsByClassName("results_lvl5");
var visible = false;
var changeVisibility = function (event) {
  var before = visible;
  console.log(event.target.innerHTML);
  var inner = event.target.innerHTML;
}

suggestion[0].addEventListener("ValueChange", changeVisibility);*/
/*
// This is used to make the suggestions slide in and out of view.
document.getElementById(suggestion).onchange = function () {
  // currentVisiblity will be compared with a future value of suggestVisible.
  // This is done in order to detect a change (or lack there of) of suggestvisible.
  var currentVisibility = suggestVisible;
  console.log("works...");

  if (this.value.length < 3)
  {
    suggestVisible = false;
    console.log("suggestVisible = false");
  }
  else
  {
    suggestVisible = true;
    console.log("suggestVisible = true");
  }

  // If suggestVisible actually changed...
  if (suggestVisible != currentVisibility)
  {
    console.log("suggestVisible != currentVisibility");
    if (suggestVisible)
    {
      suggestStyle.innerHTML =
        "#header--weather-suggestions {" +
          "height: 100%" +
        "}";
        console.log("suggestVisible is true");
    }
    else
    {
      suggestStyle.innerHTML =
        "#header--weather-suggestions {" +
          "height: 0%" +
        "}";
        console.log("suggestVisible is false");
    }
  }
} */
