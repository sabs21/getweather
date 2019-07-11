// This sets the path to the PHP files.
var phpPath = "./PHP/";

// Keeps track of whether or not the suggestions dropdown is visible.
var isVisible = false;

// This oninput function validates input first, then handles displaying suggestions.
document.getElementById("search--form-input").oninput = function() {
  var input = this.value;
  var cleanInput = this.value.replace(/[^a-z' ,-]/gi, "");
  document.getElementById("search--form-input").value = cleanInput;
  // This if statement helps avoid errors when hitting backspace on a string within the form.
  // Also, this ensures that the input contains at least one letter character.
  if (input.length > 0 && input.search(/[a-zA-Z]/) != -1)
  {
    // If the last character typed was invalid, erase it automatically.
    var lastCharTyped = input[input.length - 1];
    //input = input.replace(/[^a-z' ,-]/gi, "");

    var suggestionContainer = document.getElementById("search--suggestions");
    // Checks whether or not the suggestions dropdown is visible.
    isVisible = suggestionContainer.hasChildNodes();

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
    document.getElementById("search--form-input").onkeyup = function() {
      // Check if the first character of the input is defined.
      // This check prevents errors when the input is cleared using backspace.
      if (this.value[0] != undefined && isValid(lastCharTyped) && input.length >= 3)
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
              showSuggestions(callback, 8, function(callback) {
                var suggestions = callback;
                addListeners(false, suggestions); // Remove all previous listeners...
                addListeners(true, suggestions); // Then add all the new ones in.
                openSuggestions(true); // Opens the suggestions drop down.
              });
            }
          });
        });
      }
      else
      {
        clearSuggestions();

        openSuggestions(false);
        openStates(false);
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
  // Check if the user has typed at least three VALID characters
  // before throwing suggestions. The validity of the lastCharTyped is
  // already checked prior to the call of the function.
  if (city.length >= 3)
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
    openSuggestions(false);
    openStates(false);
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
    var stackedSuggestions = [{
      name:suggestions[0].name,
      states:[suggestions[0].state]
    }];
    var totalSuggestions = suggestions.length;
    // Keep track of which index of suggestions we're checking.
    var index = 1;
    // Tracks whether a city name has been found that wasn't previously found.
    var isUnique = true;

    // Loops through each index of 'suggestions' to compare those city names
    // with all city names from 'stackedSuggestions'. 'stackedSuggestions' holds one
    // index for each unique city name.
    while (index < totalSuggestions)
    {
      isUnique = true;

      // This loop compares one city name in 'suggestions' to
      // all unique city names found so far ('stackedSuggestions').
      for (var j = 0; j < stackedSuggestions.length; j++)
      {
        if (suggestions[index].name === stackedSuggestions[j].name)
        {
          // Add the state to the list of states with the same city name.
          var endIndex = stackedSuggestions[j].states.length;
          stackedSuggestions[j].states[endIndex] = suggestions[index].state;
          isUnique = false;
        }
      }

      if (isUnique)
      {
        // Add a new city object to 'stackedSuggestions'.
        var obj = {
          name:suggestions[index].name,
          states:[suggestions[index].state]
        };
        var endIndex = stackedSuggestions.length;
        stackedSuggestions[endIndex] = obj;
      }
      // Next iteration will compare the next city name in 'suggestions'.
      index++;
    }

    // 'totalStacks' refers to how many suggested cities have multiple states.
    // In the for loop, 'totalStacks' is used to send cities with
    // a stack of states to the beginning of the stackedSuggestions array.
    var totalStacks = 0;

    // This for loop performs swaps in order to push the suggestions with
    // multiple states to the top of the suggestions list.
    for (var i = 0, totalStacks = 0; i < stackedSuggestions.length; i++)
    {
      // If the current index city resides in more than one state,
      // then swap the indexed suggestion with the first suggestion.
      if (stackedSuggestions[i].states.length > 1)
      {
        // Swap
        var temp = stackedSuggestions[i];
        stackedSuggestions[i] = stackedSuggestions[totalStacks];
        stackedSuggestions[totalStacks] = temp;

        totalStacks++;
      }
    }

    // Replace this with heapsort eventually!
    // Check to see if there is more than one suggestion with multiple states.
    if (totalStacks > 1)
    {
      // If so, then perform a bubble sort.
      var swaps = 1;
      while (swaps > 0)
      {
        swaps = 0;

        for (var i = 0; i < totalStacks - 1; i++)
        {
          // If the higher index (which is lower in the suggestion list) has
          // more states than the lower index, swap them.
          // This is done to push the most likely suggestion to the top.
          if (stackedSuggestions[i + 1].states.length > stackedSuggestions[i].states.length)
          {
            // Swap
            var temp = stackedSuggestions[i];
            stackedSuggestions[i] = stackedSuggestions[i + 1];
            stackedSuggestions[i + 1] = temp;

            swaps++;
          }
        }
      }
    }
    callback(stackedSuggestions);
  }
}

function showSuggestions(suggestions, limit = null, callback) {
  var suggestionContainer = document.getElementById("search--suggestions");
  // Clears all previous suggestions to make way for new ones.
  suggestionContainer.innerHTML = "";

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

  var itemClass = "search--suggestions-item";
  var address = "";
  var addressClass = "";

  // This loop fills the 'search--suggestions' element with
  // new suggestions.
  for (var i = 0; i < limit; i++)
  {
    // This div is used to hold the content of each individual suggestion.
    var item = document.createElement("div");
    item.className = itemClass;
    suggestionContainer.appendChild(item);

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
  var input = document.getElementById("search--form-input").value;
  var singleStateClassName = "search--suggestions-item-single";
  var multipleStateClassName = "search--suggestions-item-multiple";
  var allSuggestions = document.getElementsByClassName("search--suggestions-item");

  // This is the function that will be used for each single state event listener.
  var single = function(event) {
    // 'item' refers to a suggestion within the suggestion-item container.
    var item = event.target.innerHTML;

    clearSuggestions();
    // Retract the suggestions from view
    openSuggestions(false);
    openStates(false);
    // Replace the text within the input field to the suggestion that was clicked.
    document.getElementById("search--form-input").value = item;
    // Simulate clicking submit in order to get weather data.
    document.getElementById("search--form-submit").click();
  };

  // This fires on suggestions with multiple states.
  // I still need to have the stateContainer point to the suggestion that
  // was clicked on.
  var multiple = function(event) {
    // Open the side menu containing the stack of state while invisible.
    openStates(true);

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

    var statesContainer = document.getElementById("states--results");
    // Clears out any previous states that were found.
    statesContainer.innerHTML = "";

    var states = suggestions[index].states;

    for (var i = 0; i < states.length; i++)
    {
      var newState = document.createElement("button");
      newState.className = "states--results-item";
      newState.innerHTML = states[i];
      newState.city = city;
      newState.addEventListener("click", chosenState);
      statesContainer.appendChild(newState);
    }
    openStates(true, true);
  }

  var chosenState = function(event) {
    console.log(event);
    var city = event.target.city;
    var state = event.target.innerHTML;

    var formInput = document.getElementById("search--form-input");
    // Replace the text within the input field to the suggestion that was clicked.
    formInput.value = city + ", " + state;

    clearSuggestions();
    // Retract the suggestions from view
    openSuggestions(false);
    openStates(false);

    // Simulate clicking submit in order to get weather data.
    document.getElementById("search--form-submit").click();
  }

  if (input.length >= 3)
  {
    for (var i = 0; i < allSuggestions.length; i++)
    {
      var currentSuggestion = allSuggestions[i].childNodes[0];
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
        // Since javascript is very reliant on the idea of prototypes, we can
        // use this to store an index variable in the event object.
        // By doing this, we can actually pass parameters on to our event
        // listener function.
        currentSuggestion.index = i;
        if (addListener)
        {
          currentSuggestion.addEventListener("click", multiple);
        }
        else
        {
          currentSuggestion.removeEventListener("click", multiple);
        }
      }
    }
  }
}

function openSuggestions(open) {
  // The 'style' var holds styling for each suggestion item.
  // CSS elements are assigned to 'style' innerHTML.
  var style = document.createElement("style");
  // Then the style tag is appended to the head of the HTML document.
  var ref = document.querySelector("head");
  // Finally, we add the element to the HTML.
  ref.appendChild(style);

  if (open)
  {
    // An 'item' in this context refers to a single suggestion from the list.
    var items = document.getElementsByClassName("search--suggestions-item");
    var totalItems = items.length;
    // The choice of index doesn't matter since all items will have the same
    // height. 'offsetHeight' returns the element's true height. Note that
    // 'offsetHeight' doesn't factor in margin;
    var height = items[0].offsetHeight;

    var totalHeight = height * totalItems;

    style.innerHTML =
      "#search--suggestions {" +
        "height: " + totalHeight + "px" +
      "}";
  }
  else
  {
    style.innerHTML =
      "#search--suggestions {" +
        "height: 0px" +
      "}";
  }
}

function clearSuggestions() {
  // Clear both suggestion containers of any suggestions.
  document.getElementById("states--results").innerHTML = "";
  document.getElementById("search--suggestions").innerHTML = "";
}

function openStates (openInvisible, getWidth = false) {
  // The 'style' var holds styling for each suggestion item.
  // CSS elements are assigned to 'style' innerHTML.
  var style = document.createElement("style");
  // Then the style tag is appended to the head of the HTML document.
  var ref = document.querySelector("head");
  // Finally, we add the element to the HTML.
  ref.appendChild(style);

  var width = 0;
  var height = 0;

  console.log(document.getElementById("states"));

  if (openInvisible)
  {
    width = 250;
  }
  else
  {
    width = 0;
  }

  if (getWidth)
  {
    var totalStates = document.getElementsByClassName("states--results-item").length;
    console.log(totalStates);
    // The '* 60' is for the height of the buttons plus their margins
    // The '- 20' is adjust for the first row and last row's margins.
    var resultsHeight = Math.ceil(totalStates / 3) * 60;

    var suggestions = document.getElementsByClassName("search--suggestions-item");
    var totalSuggestions = suggestions.length;
    var suggestionHeight = suggestions[0].offsetHeight * suggestions.length;

    var input = document.getElementById("search--form-input");
    var inputHeight = input.offsetHeight;

    var maxHeight = suggestionHeight + inputHeight;
    height = resultsHeight;

    console.log(maxHeight + " " + resultsHeight + " " + height);

    if (resultsHeight > maxHeight)
    {
      height = maxHeight;
    }
  }
  style.innerHTML =
    "#states {" +
      "height: " + height + "px;" +
      "width: " + width + "px;" +
    "}\n";
}
// Make ALL incoming city name input data ALL LOWERCASE.
