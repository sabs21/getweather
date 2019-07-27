document.getElementById("nav--recent").addEventListener("click", function() {
  document.getElementById("recent").className = "";
});

document.getElementById("recent--close").addEventListener("click", function() {
  document.getElementById("recent").className = "collapsed";
})
