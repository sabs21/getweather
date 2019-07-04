// CSS elements are assigned to 'style' innerHTML.
var style = document.createElement("style");
// Then the style tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(style);
// From here, we may begin editing the css of the document.

// Using style, we will tinker with animations that play onload.
window.addEventListener("load", function() {
  style.innerHTML =
    "#header--title {" +
      "opacity: 1;" +
    "}\n";

  setTimeout(function() {
    // After the first innerHTML edit, the innerHTML must be concatenated.
    // If we don't concatenate, then we will lose previously defined styling.
    style.innerHTML +=
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
    style.innerHTML +=
      "#header--title-seperate {" +
        "height: 2px;" +
        "margin-top: 160px;" +
      "}\n";
  }, 1000);

  setTimeout(function() {
    style.innerHTML +=
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
    style.innerHTML +=
      "#header--weather {" +
        "opacity: 1;" +
      "}\n";
  }, 2400)
});
