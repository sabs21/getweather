window.addEventListener("load", function() {
  document.getElementById("title").className = "visible center"

  setTimeout(function() {
      document.getElementById("title--get").className = "visible";
      document.getElementById("title--weather").className = "visible";
      document.querySelector("#puddle--left div").className = "visible";
      document.querySelector("#puddle--right div").className = "visible";
  }, 500);

  setTimeout(function() {
    document.getElementById("title--line").className = "drop";
    document.querySelector("#title--line div").className = "shrink";
  }, 1000);

  setTimeout(function() {
    document.querySelector("#title--line div").className = "shrink hidden";
    document.querySelector("#puddle--left div").className = "visible spread";
    document.querySelector("#puddle--right div").className = "visible spread";
    document.getElementById("title--get").className = "visible closeGap";
    document.getElementById("title--weather").className = "visible closeGap";
  }, 1500);

  setTimeout(function() {
      document.getElementById("search").className = "visible";
  }, 2200)

  setTimeout(function() {
      document.getElementById("puddle").className = "remove";
      document.getElementById("title").className = "visible center readjust";
  }, 3000)
});
