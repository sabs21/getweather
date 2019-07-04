// This sets the path to the PHP files.
var phpPath = "./PHP/";

// Keeps track of whether or not the suggestions dropdown is visible.
var visible = false;


document.getElementById("header--weather-form-input").oninput = function() {

  // This if statement helps avoid errors when hitting backspace on a string within the form.
  // Also, this ensures that the input contains at least one letter character.
  if (this.value.length > 0 && this.value.search(/[a-zA-Z]/) != -1)
  {
    // If the last character typed was invalid, erase it automatically.
    var lastCharTyped = this.value[this.value.length - 1];
    this.value = this.value.replace(/[^a-z' ,-]/gi, "");

    // Keeps track of whether or not the suggestions dropdown is visible.
    var suggestionItems = document.getElementById("header--weather-suggestions-items");
    visible = suggestionItems.hasChildNodes();

    // if there is a comma delimiter within the input string...
    if (this.value.search(",") != -1)
    {
      // Split up the input into an array to fill the state and city variables.
      // The limit is set to 3 so that no garbage collects in the second array element (in case more commas were added after state)
      var inputArray = this.value.split(",", 3);
      var city = inputArray[0];
      var state = inputArray[1];
    }
    else
    {
      var city = this.value;
      var state = null;
    }

    // This gets all possible suggestions, then displays them on the page.
    document.getElementById("header--weather-form-input").onkeyup = function() {
      // Check if the first character of the input is defined.
      // This check prevents errors when the input is cleared using backspace.
      if (this.value[0] != undefined)
      {
        getSuggestions(city, state, lastCharTyped, function(callback) {
          console.log(callback);
          showSuggestions(callback, 15, function() {
            addListeners(false); // Remove all previous listeners...
            addListeners(true); // Then add all the new ones in.
            animate(true); // Opens the suggestions drop down.
          });
        });
      }
    }
  }
}



// Tests the last typed character to see if it's valid. Returns boolean.
function isValid(str) {
  var exp = new RegExp("[a-z' ,-]", "gi");
  return exp.test(str[str.length - 1]);
}

// Retrieves a max of 15 city suggestions
function getSuggestions(city, state, lastCharTyped, callback) {
  // Check if the user has typed at least three VALID characters before throwing suggestions.
  if (city.length >= 3 && isValid(lastCharTyped))
  {
    // If statements that handle when the user doesn't input a state.
    if (state != null)
    {
      var url = phpPath + "citySearch.php?cityInput=" + city + "&stateInput=" + state;
    }
    else
    {
      var url = phpPath + "citySearch.php?cityInput=" + city;
    }

    var suggestion = new XMLHttpRequest();
    suggestion.open("GET", url, true);
    suggestion.onreadystatechange = function() {
      if (suggestion.readyState == 4)
      {
        if (suggestion.status == 200)
        {
          var suggest_list = this.responseText;
          console.log(suggest_list);

          callback(suggest_list);
        }
      }
    }
    suggestion.send();
  }
  else if (city.length < 3)
  {
    // Closes the suggestions drop down.
    animate(false);

    // Clear any previous error messsages from the error bar.
    document.getElementById("error").innerHTML = "";
  }
}

function showSuggestions(suggestionString, limit = null, callback) {
  // Clears all previous suggestions to make way for new ones.
  document.getElementById("header--weather-suggestions-items").innerHTML = "";
  console.log("limit = " + limit);

  var list = document.getElementById("header--weather-suggestions-items");

  // If the suggestionString is false (false is a string, not a boolean), then
  // display an error message as a suggestion.
  if (suggestionString == "false")
  {
    document.getElementById("error").innerHTML = "No cities found.";
  }
  else
  {
    // Clear any previous error messsages from the error bar.
    document.getElementById("error").innerHTML = "";

    console.log("limit = " + limit);

    var suggestionArray = JSON.parse(suggestionString);
    console.log(suggestionArray);
    console.log(suggestionArray[1]);
    var suggestLimit = suggestionArray.length;

    if (limit != null)
    {
      console.log("limit = " + limit);
      console.log("limit = " + suggestLimit);
      // If the amount of items in the array exceed the limit, enforce the limit.
      if (limit < suggestLimit)
      {
        suggestLimit = limit;
        console.log("limit = " + suggestLimit);
      }
    }

    console.log("limit = " + suggestLimit);

    // This loop fills the 'header--weather-suggestions-items' element with new suggestions.
    for (var i = 0; i < suggestLimit; i++)
    {
      console.log("new suggestion created");
      // Each suggestion will be a button.
      var newSuggestion = document.createElement("button");
      // The button's innerHTML syntax will be [city name], [state]
      newSuggestion.innerHTML = suggestionArray[i].name + ", " + suggestionArray[i].state;
      // Put the new suggestion within the 'results_lvl5' class for easy DOM access.
      newSuggestion.className = "results_lvl5";
      // Add this new element to the DOM.
      list.appendChild(newSuggestion);
    }
  }
  callback();
}

// If true, add event listeners. If false, remove event listeners.
function addListeners(bool) {
  var input = document.getElementById("header--weather-form-input").value;
  var suggestions = document.getElementsByClassName("results_lvl5");

  if (input.length >= 3)
  {
    for (var i = 0; i < suggestions.length; i++)
    {
      // This is the function that will be used for each event listener.
      var suggestionClick = function(event) {
        var citystate = event.target.innerHTML;

        // Clears all previous suggestions to make way for new ones.
        document.getElementById("header--weather-suggestions-items").innerHTML = "";
        // Replace the text within the input field to the suggestion that was clicked.
        document.getElementById("header--weather-form-input").value = citystate;
        // Simulate clicking submit in order to get weather data.
        document.getElementById("header--weather-form-submit").click();
      };

      if (bool)
      {
        suggestions[i].addEventListener("click", suggestionClick);
      }
      else
      {
        suggestions[i].removeEventListener("click", suggestionClick);
      }
    }
  }
}

function animate(bool) {
  // CSS elements are assigned to 'suggestStyle' innerHTML.
  var suggestStyle = document.createElement("style");
  // Then the style tag is appended to the head of the HTML document.
  var ref = document.querySelector("head");
  // Finally, we add the element to the HTML.
  ref.appendChild(suggestStyle);

  if (bool)
  {
    var list = document.getElementsByClassName("results_lvl5");
    var listLen = list.length;
    // The first and last child have margins that extend 12px.
    // Every child that isnt the first or last extend their margin 8px.
    var margin = 24 + 8 * (listLen - 1);
    // Each button has a height of 26px.
    var buttonHeight = listLen * 26;
    var totalHeight = margin + buttonHeight;

    suggestStyle.innerHTML =
      "#header--weather-suggestions {" +
        "height: " + totalHeight + "px" +
      "}";
  }
  else
  {
    suggestStyle.innerHTML =
      "#header--weather-suggestions {" +
        "height: 0px" +
      "}";
  }
}
// Make ALL incoming city name input data ALL LOWERCASE.
