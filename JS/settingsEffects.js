document.getElementById("nav--settings").addEventListener("click", function() {
  document.getElementById("settings").className = "";
  // it does work when clicked on
  //window.alert("works");
});

document.getElementById("settings--close").addEventListener("click", function() {
  document.getElementById("settings").className = "collapsed";
});
