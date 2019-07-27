// CSS elements are assigned to 'style' innerHTML.
var style = document.createElement("style");
// Then the style tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(style);
// From here, we may begin editing the css of the document.

document.getElementById("nav--recent").addEventListener("click", function() {
  // Since the tri-dots will only be visible when the sidebar is closed, then
  // we will only handle opening the side bar with the tri-dots.
  style.innerHTML +=
  "#recent {" +
    "width: " + 400 + "px;" +
  "}";
});
