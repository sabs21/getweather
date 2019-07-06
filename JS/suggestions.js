// This sets the path to the PHP files.
var phpPath = "./PHP/";

// Keeps track of whether or not the suggestions dropdown is visible.
var isVisible = false;

// This oninput function validates input first, then handles displaying suggestions.
document.getElementById("header--weather-form-input").oninput = function() {
  var input = this.value;
  // This if statement helps avoid errors when hitting backspace on a string within the form.
  // Also, this ensures that the input contains at least one letter character.
  if (input.length > 0 && input.search(/[a-zA-Z]/) != -1)
  {
    // If the last character typed was invalid, erase it automatically.
    var lastCharTyped = input[input.length - 1];
    input = input.replace(/[^a-z' ,-]/gi, "");

    var suggestionItems = document.getElementById("header--weather-suggestions-items");
    // Checks whether or not the suggestions dropdown is visible.
    isVisible = suggestionItems.hasChildNodes();

    // if there is a comma delimiter within the input string...
    if (input.search(",") != -1)
    {
      // Split up the input into an array to fill the state and city variables.
      // The limit is set to 3 so that no garbage collects in the
      // second array element (in case more commas were added after state).
      var inputArgs = input.split(",", 3);
      var city = inputArgs[0];
      var state = inputArgs[1];
    }
    else
    {
      var city = input;
      var state = null;
    }

    // This gets all possible suggestions, then displays them on the page.
    document.getElementById("header--weather-form-input").onkeyup = function() {
      // Check if the first character of the input is defined.
      // This check prevents errors when the input is cleared using backspace.
      if (this.value[0] != undefined)
      {
        getSuggestions(city, state, lastCharTyped, function(callback) {
          var suggestionStr = callback;
          stackSuggestions(suggestionStr, function (callback) {
            console.log(callback);
          });
          /*showSuggestions(callback, 15, function() {
            addListeners(false); // Remove all previous listeners...
            addListeners(true); // Then add all the new ones in.
            animate(true); // Opens the suggestions drop down.
          });*/
        });
      }
    }
  }
}

// Tests the last typed character to see if it's valid. Returns boolean.
function isValid(str) {
  var isValidChar = new RegExp("[a-z' ,-]", "gi");
  return isValidChar.test(str[str.length - 1]);
}

// Retrieves a max of 15 city suggestions
function getSuggestions(city, state, lastCharTyped, callback) {
  // Check if the user has typed at least three VALID characters before throwing suggestions.
  if (city.length >= 3 && isValid(lastCharTyped))
  {
    var url = "";

    // If statements that handle when the user doesn't input a state.
    if (state != null)
    {
      url = phpPath + "citySearch.php?cityInput=" + city + "&stateInput=" + state;
    }
    else
    {
      url = phpPath + "citySearch.php?cityInput=" + city;
    }

    // Requests to retreive all possible suggestions.
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = function() {
      if (request.readyState == 4)
      {
        if (request.status == 200)
        {
          var suggestions = this.responseText;
          callback(suggestions);
        }
      }
    }
    request.send();
  }
  else if (city.length < 3)
  {
    // Closes the suggestions drop down.
    animate(false);
    // Clear any previous error messsages from the error bar.
    document.getElementById("error").innerHTML = "";
  }
}

// Takes the suggestions array as input.
// Reorganizes the info into an object.
function stackSuggestions(suggestionStr, callback) {
  if (suggestionStr == "false")
  {
    //document.getElementById("error").innerHTML = "No cities found.";
    return "No cities found.";
  }
  else
  {
    var suggestions = JSON.parse(suggestionStr);
    // Fill nameAndStates pre-emptively before the loops start. This way, we
    // can prevent the loops from doing more computations than they have to.
    var namesAndStates = [{
      name:suggestions[0].name,
      states:[suggestions[0].state]
    }];
    var totalSuggestions = suggestions.length;
    // Keep track of which index of suggestions we're checking.
    var index = 1;
    var len = namesAndStates.length;

    for (var i = index; i < totalSuggestions; i++)
    {
      for (var j = 0; j < len; j++)
      {
        console.log("i = " + i + " and j = " + j);
        if (suggestions[i].name === namesAndStates[j].name)
        {
          // I didn't use push() for performance reasons.
          var totalStates = namesAndStates[j].states.length;
          namesAndStates[j].states[totalStates] = suggestions[i].state;
          console.log(namesAndStates);
        }
        else
        {
          // If the city name in suggestions is unique, then
          // create a new object to be added to namesAndStates.
          var obj = {
            name:suggestions[i].name,
            states:[suggestions[i].state]
          };
          var arrLen = namesAndStates.length;
          namesAndStates[arrLen] = obj;
          console.log(namesAndStates);
          // Reset i to index and j to 0
          //i = index;
          //j = 0;
        }
      }
      len++;
    }

    callback(namesAndStates);
  }
}

function showSuggestions(suggestionStr, limit = null, callback) {
  suggestionItems = document.getElementById("header--weather-suggestions-items");
  // Clears all previous suggestions to make way for new ones.
  suggestionItems.innerHTML = "";

  // If the suggestionStr is false (false is a string, not a boolean), then
  // display an error message as a suggestion.
  if (suggestionStr == "false")
  {
    document.getElementById("error").innerHTML = "No cities found.";
  }
  else
  {
    // Clear any previous error messsages from the error bar.
    document.getElementById("error").innerHTML = "";

    var suggestions = JSON.parse(suggestionStr);
    var totalSuggestions = suggestions.length;

    if (limit != null)
    {
      // If the amount of items in the array is less than the limit, then let
      // the limit become however many suggestions there are.
      if (limit > totalSuggestions)
      {
        limit = totalSuggestions;
      }
    }
    else
    {
      limit = totalSuggestions;
    }

    // This loop fills the 'header--weather-suggestions-items' element with new suggestions.
    for (var i = 0; i < limit; i++)
    {
      // Each suggestion will be a button element.
      var newSuggestion = document.createElement("button");
      // The button's innerHTML syntax will be [city name], [state]
      newSuggestion.innerHTML = suggestions[i].name + ", " + suggestions[i].state;
      // Put the new suggestion within the 'items' class for easy DOM access.
      newSuggestion.className = "items";
      // Add this new element to the DOM.
      suggestionItems.appendChild(newSuggestion);
    }
  }
  callback();
}

// If true, add event listeners. If false, remove event listeners.
function addListeners(bool) {
  var input = document.getElementById("header--weather-form-input").value;
  var suggestions = document.getElementsByClassName("items");

  if (input.length >= 3)
  {
    for (var i = 0; i < suggestions.length; i++)
    {
      // This is the function that will be used for each event listener.
      var suggestionClick = function(event) {
        // 'item' refers to a suggestion within the suggestion-item container.
        var item = event.target.innerHTML;

        // Clears all previous suggestions to make way for new ones.
        document.getElementById("header--weather-suggestions-items").innerHTML = "";
        // Replace the text within the input field to the suggestion that was clicked.
        document.getElementById("header--weather-form-input").value = item;
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
  // The 'style' var holds styling for each suggestion item.
  // CSS elements are assigned to 'style' innerHTML.
  var style = document.createElement("style");
  // Then the style tag is appended to the head of the HTML document.
  var ref = document.querySelector("head");
  // Finally, we add the element to the HTML.
  ref.appendChild(style);

  if (bool)
  {
    // 'items' refers to each suggestion within the suggestion-item container.
    var items = document.getElementsByClassName("items");
    var totalItems = items.length;
    // The first and last child have margins that extend 12px.
    // Every child that isnt the first or last extend their margin 8px.
    var margin = 24 + 8 * (totalItems - 1);
    // Each button has a height of 26px.
    var buttonHeight = totalItems * 26;
    var totalHeight = margin + buttonHeight;

    style.innerHTML =
      "#header--weather-suggestions {" +
        "height: " + totalHeight + "px" +
      "}";
  }
  else
  {
    style.innerHTML =
      "#header--weather-suggestions {" +
        "height: 0px" +
      "}";
  }
}
// Make ALL incoming city name input data ALL LOWERCASE.
