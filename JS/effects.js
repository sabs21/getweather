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
    "#title {" +
      "opacity: 1;" +
    "}\n";

  setTimeout(function() {
    // After the first innerHTML edit, the innerHTML must be concatenated.
    // If we don't concatenate, then we will lose previously defined styling.
    style.innerHTML +=
      "#title--get {" +
        "background-position: -119px 0px;" +
      "}\n" +
      "#title--weather {" +
        "background-position: -239px 0px;" +
      "}\n" +
      "#puddle--right-line, #puddle--left-line {" +
        "opacity: 1;" +
      "}\n";
  }, 500);

  setTimeout(function() {
    style.innerHTML +=
      "#title--dividerContainer {" +
        "margin-top: 70px;" +
      "}\n" +
      "#title--dividerLine {" +
        "height: 2px;" +
      "}\n";
  }, 1000);

  setTimeout(function() {
    style.innerHTML +=
      "#title--dividerLine {" +
        "visibility: hidden" +
      "}\n" +
      "#puddle--right-line {" +
        "width: 320px;" +
      "}\n" +
      "#puddle--left-line {" +
        "width: 130px;" +
      "}\n" +
      "#title--get {" +
        "margin-right: 0px;" +
      "}\n" +
      "#title--weather {" +
        "margin-left: 0px;" +
      "}\n";
  }, 1500);

  setTimeout(function() {
    style.innerHTML +=
      "#search {" +
        "opacity: 1;" +
      "}\n";
  }, 2200)

  setTimeout(function() {
    style.innerHTML +=
    // Remove puddle from view.
      "#puddle {" +
        "display: none;" +
        //"opacity: 0" +
      "}\n" +
      // Nudges input form upwards by reducing the height of the title block.
      // This is done so that the input form doesn't move when puddle is removed.
      "#title {" +
        //"margin-bottom: -41px;"
        "height: 130px;" +
      "}\n";
  }, 3000)
});
