// This sets the path to the PHP files.
var phpPath = "./PHP/";

// Keeps track of whether or not the suggestions dropdown is visible.
var isVisible = false;

// This oninput function validates input first, then handles displaying suggestions.
document.getElementById("header--weather-form-input").oninput = function() {
  var input = this.value;
  var cleanInput = this.value.replace(/[^a-z' ,-]/gi, "");
  document.getElementById("header--weather-form-input").value = cleanInput;
  // This if statement helps avoid errors when hitting backspace on a string within the form.
  // Also, this ensures that the input contains at least one letter character.
  if (input.length > 0 && input.search(/[a-zA-Z]/) != -1)
  {
    // If the last character typed was invalid, erase it automatically.
    var lastCharTyped = input[input.length - 1];
    //input = input.replace(/[^a-z' ,-]/gi, "");

    var suggestionItems = document.getElementById("header--weather-suggestions-container");
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
      if (this.value[0] != undefined && isValid(lastCharTyped))
      {
        getSuggestions(city, state, lastCharTyped, function(callback) {
          var suggestionStr = callback;
          stackSuggestions(suggestionStr, function (callback) {
            console.log(callback);
            if (callback === "No cities found.")
            {
              document.getElementById("error").innerHTML = "No cities found.";
            }
            else
            {
              showSuggestions(callback, 15, function(callback) {
                var suggestions = callback;
                addListeners(false, suggestions); // Remove all previous listeners...
                addListeners(true, suggestions); // Then add all the new ones in.
                animate(true); // Opens the suggestions drop down.
              });
            }
          });
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
    callback("No cities found.");
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
    // Tracks whether a city name has been found that wasn't previously found.
    var isUnique = true;

    // Loops through each index of 'suggestions' to compare those city names
    // with all city names from 'namesAndStates'. 'namesAndStates' holds one
    // index for each unique city name.
    while (index < totalSuggestions)
    {
      isUnique = true;

      // This loop compares one city name in 'suggestions' to
      // all unique city names found so far ('namesAndStates').
      for (var j = 0; j < namesAndStates.length; j++)
      {
        if (suggestions[index].name === namesAndStates[j].name)
        {
          // Add the state to the list of states with the same city name.
          var lastIndex = namesAndStates[j].states.length;
          namesAndStates[j].states[lastIndex] = suggestions[index].state;
          isUnique = false;
        }
      }

      if (isUnique)
      {
        // Add a new city object to 'namesAndStates'.
        var obj = {
          name:suggestions[index].name,
          states:[suggestions[index].state]
        };
        var lastIndex = namesAndStates.length;
        namesAndStates[lastIndex] = obj;
      }
      // Next iteration will compare the next city name in 'suggestions'.
      index++;
    }
    callback(namesAndStates);
  }
}

function showSuggestions(suggestions, limit = null, callback) {
  var suggestionItems = document.getElementById("header--weather-suggestions-container");
  // Clears all previous suggestions to make way for new ones.
  suggestionItems.innerHTML = "";

  // Clear any previous error messsages from the error bar.
  document.getElementById("error").innerHTML = "";

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

  var itemClass = "header--weather-suggestions-container-item";
  var address = "";
  var addressClass = "";

  // This loop fills the 'header--weather-suggestions-container' element with
  // new suggestions.
  for (var i = 0; i < limit; i++)
  {
    // This div is used to hold the content of each individual suggestion.
    var item = document.createElement("div");
    item.className = itemClass;
    suggestionItems.appendChild(item);

    item = document.getElementsByClassName(itemClass);
    item = item[i];

    if (suggestions[i].states.length > 1)
    {
      address = suggestions[i].name + ", ...";
      addressClass = itemClass + "-multiple";
    }
    else
    {
      address = suggestions[i].name + ", " + suggestions[i].states[0];
      addressClass = itemClass + "-single";
    }

    var newAddress = document.createElement("button");
    newAddress.className = addressClass;
    newAddress.innerHTML = address;
    item.appendChild(newAddress);
  }
  callback(suggestions);
}

// Add event handlers in a different function to handle when each suggestion
// is clicked.

// If addListener is true, add event listeners. If false, remove event listeners.
function addListeners(addListener, suggestions) {
  var input = document.getElementById("header--weather-form-input").value;
  var singleStateClassName = "header--weather-suggestions-container-item-single";
  var multipleStateClassName = "header--weather-suggestions-container-item-multiple";
  var allItems = document.getElementsByClassName("header--weather-suggestions-container-item");

  // This is the function that will be used for each single state event listener.
  var single = function(event) {
    // 'item' refers to a suggestion within the suggestion-item container.
    var item = event.target.innerHTML;

    // Clears all previous suggestions.
    document.getElementById("header--weather-suggestions-container").innerHTML = "";
    // Replace the text within the input field to the suggestion that was clicked.
    document.getElementById("header--weather-form-input").value = item;
    // Simulate clicking submit in order to get weather data.
    document.getElementById("header--weather-form-submit").click();
  };

  // This fires on suggestions with multiple states.
  // I still need to have the stateContainer point to the suggestion that
  // was clicked on.
  var multiple = function(event) {
    console.log(event);
    // This is the index value that was passed to the function as a "parameter".
    // We need the index of where the suggestion is in the suggestion container
    // in order to pinpoint it with the states menu later.
    var index = event.target.index;
    // 'str' is the city name followed by a comma and periods.
    // [city name], ...
    var str = event.target.innerHTML;
    // 'city' is the substring of 'str' that leaves out the commas and periods.
    var city = "";

    // Removes everything in the innerHTML past the comma to get the city name.
    // The city name will be paired with the selected state to finalize an input.
    for (var i = 0; i < str.length; i++)
    {
      if (str[i] === ",")
      {
        city = str.substring(0, i);
      }
    }

    var statesContainer = document.getElementById("header--statesContainer");
    // Clears out any previous states that were found.
    statesContainer.innerHTML = "";

    var states = suggestions[index].states;

    for (var i = 0; i < states.length; i++)
    {
      var newState = document.createElement("button");
      newState.className = "header--statesContainer-item";
      newState.innerHTML = states[i];
      newState.city = city;
      newState.addEventListener("click", chosenState);
      statesContainer.appendChild(newState);
    }
  }

  var chosenState = function(event) {
    console.log(event);
    var city = event.target.city;
    var state = event.target.innerHTML;

    var formInput = document.getElementById("header--weather-form-input");
    // Replace the text within the input field to the suggestion that was clicked.
    formInput.value = city + ", " + state;

    // Clear both suggestion containers of any suggestions.
    document.getElementById("header--statesContainer").innerHTML = "";
    document.getElementById("header--weather-suggestions-container").innerHTML = "";

    // Simulate clicking submit in order to get weather data.
    document.getElementById("header--weather-form-submit").click();
  }

  if (input.length >= 3)
  {
    for (var i = 0; i < allItems.length; i++)
    {
      var currentSuggestion = allItems[i].childNodes[0];
      var currentSuggestionClassName = currentSuggestion.className;

      if (currentSuggestionClassName === singleStateClassName)
      {
        if (addListener)
        {
          currentSuggestion.addEventListener("click", single);
        }
        else
        {
          currentSuggestion.removeEventListener("click", single);
        }
      }
      else if (currentSuggestionClassName === multipleStateClassName)
      {
        if (addListener)
        {
          // Since javascript is very reliant on the idea of prototypes, we can
          // use this to store an index variable in the event object.
          // By doing this, we can actually pass parameters on to our event
          // listener function.
          currentSuggestion.index = i;
          currentSuggestion.addEventListener("click", multiple);
        }
        else
        {
          currentSuggestion.index = i;
          currentSuggestion.removeEventListener("click", multiple);
        }
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
    // 'item' refers to each suggestion within the suggestion-item container.
    var items = document.getElementsByClassName("item");
    var totalItems = items.length;
    // The first and last child have margins that extend 12px.
    // Every child that isnt the first or last extend their margin 8px.
    //var margin = 24 + 8 * (totalItems - 1);
    // Each button has a height of 26px.
    //var buttonHeight = totalItems * 26;
    //var totalHeight = margin + buttonHeight;
    var totalHeight = 500;

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
