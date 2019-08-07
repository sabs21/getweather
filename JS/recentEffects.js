// The 'style' var holds styling for each suggestion item.
// CSS elements are assigned to 'style' innerHTML.
var style = document.createElement("style");
// Then the style tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(style);

var conditionColor = {
  clear: "rgb(27, 112, 224)",
  clouds: "rgb(177, 183, 189)",
  drizzle: "rgb(163, 207, 227)",
  rain: "rgb(80, 120, 145)",
  thunderstorm: "rgb(86, 102, 95)",
  snow: "rgb(242, 242, 242)",
  mist: "rgb(135, 160, 212)",
  fog: "rgb(89, 111, 124)",
  haze: "rgb(158, 161, 133)",
  default: "rgb(35, 161, 79)"
}

document.getElementById("recent--addResult").addEventListener("click", function() {
  var cookies = splitCookies();
  var index = cookies.length - 1;
  var totalResults = document.getElementById("recent--searches").childNodes.length;
  console.log(totalResults);

  if (index > totalResults)
  {
    var newestCookie = cookies[index];
    var data = splitCookieData(newestCookie);

    var bgColor = getBGColor(data[3]);
    var tempColor = getTempColor(data[6], true);

    createResult(data, bgColor, tempColor);
  }
});

window.addEventListener("load", function() {
  var cookies = splitCookies();
  var index = 0;
  var done = false;

  while(!done)
  {
    index += 1;

    if (index == cookies.length)
    {
      done = true;
    }
    else
    {
      var data = splitCookieData(cookies[index]);
      var bgColor = getBGColor(data[3]);
      var tempColor = getTempColor(data[6], true);

      createResult(data, bgColor, tempColor);
    }
  }

  var viewportHeight = window.innerHeight;
  // Occupied space is the total vertical space taken up by elements and their
  // heights/margins. This does not include the recent searches wrapper element.
  var occupiedSpace = 60 + 20 + 20;

  // By subtracting the viewport height from the occupied height, we can define
  // a safe space for the previous searches wrapper to sit.
  style.innerHTML +=
  "#recent--searches {" +
    "height: " + (viewportHeight - occupiedSpace) + "px;" +
  "}";
});

window.addEventListener("resize", function() {
  var viewportHeight = window.innerHeight;
  var occupiedSpace = 60 + 20 + 20;

  style.innerHTML +=
  "#recent--searches {" +
    "height: " + (viewportHeight - occupiedSpace) + "px;" +
  "}";
});

// Opens the recent searches sidebar when the tri dot button is clicked.
document.getElementById("nav--recent").addEventListener("click", function() {
  document.getElementById("recent").className = "";
  var settings = document.getElementById("settings")

  // If the settings sidebar is open, then close it.
  if (settings.className != "collapsed")
  {
    settings.className = "collapsed";
  }
});

// Closes the recent searches sidebar when the tri dot button is clicked.
document.getElementById("recent--close").addEventListener("click", function() {
  document.getElementById("recent").className = "collapsed";
});

function splitCookies() {
  // Replaces any special characters with what they represent.
  var decodedCookie = decodeURIComponent(document.cookie);
  // Create an array of all cookies by seperating them by semi-colons.
  var cookies = decodedCookie.split(";");
  console.log(cookies);
  return cookies;
}

function splitCookieData(cookieStr) {
  var equalsIndex = cookieStr.indexOf("=") + 1;
  var cookieName = cookieStr.substring(0, equalsIndex);
  var cookieData = cookieStr.replace(cookieName, "");
  return cookieData.split("|");
  /*
  // Remember, the array of data will be structured as follows:
  // [0]: Timestamp in seconds since Jan 1, 1970.
  // [1]: City Name
  // [2]: State
  // [3]: Current Weather Conditions
  // [4]: Description of Current Weather Condition
  // [5]: Barometric pressure
  // [6]: Temperature (Fahrenheit)
  // [7]: Humidity (in percentage)
  // [8]: Latitude
  // [9]: Longitude
  */
}

function getFormalTime(milliseconds = null) {
  var date = new Date();

  if (milliseconds != null)
  {
    date.setTime(milliseconds);
  }

  // Converts military time to 12 hour format.
  var hours = date.getHours();
  var morningOrEvening = " AM";
  if (hours > 12)
  {
    hours = hours - 12;
    morningOrEvening = " PM";
  }

  var minutes = date.getMinutes();
  if (minutes < 10)
  {
    minutes = "0" + minutes;
  }

  var timestamp = hours + ":" + minutes + morningOrEvening;
  return timestamp;
}

function getBGColor(conditionStr) {
  switch (conditionStr)
  {
    case "Clear":
      return conditionColor.clear;
    case "Clouds":
      return conditionColor.clouds;
    case "Drizzle":
      return conditionColor.drizzle;
    case "Rain":
      return conditionColor.rain;
    case "Thunderstorm":
      return conditionColor.thunderstorm;
    case "Snow":
      return conditionColor.snow;
    case "Mist":
      return conditionColor.mist;
    case "Fog":
      return conditionColor.fog;
    case "Haze":
      return conditionColor.haze;
    default:
      return conditionColor.default;
  }
}

function getTempColor(temperature, isFahrenheit) {
  var red = 0;
  var green = 0;
  var blue = 0;
  var maxBrightness = 230;

  if (isFahrenheit)
  {
    // 'transitionGap' is the degree difference it takes to entirely change
    // from one color to another color.
    var transitionGap = 20;
    // 'increment' is how much the color value will change with each degree.
    var increment = maxBrightness / transitionGap;
    // 'difference' is a temperature that sits between the transition gap.
    var difference = temperature % transitionGap;
    // 'transition' is the color value to be assigned to red, green, or blue.
    var transition = 0;

    if (difference == 0)
    {
      transition = maxBrightness;
    }
    else
    {
      transition = increment * difference
    }

    if (temperature >= 100)
    {
      red = maxBrightness;
    }
    else if (temperature >= 80)
    {
      red = maxBrightness;
      green = maxBrightness - transition;
    }
    else if (temperature >= 60)
    {
      red = maxBrightness;
      green = maxBrightness;
      blue = maxBrightness - transition;
    }
    else if (temperature >= 40)
    {
      red = maxBrightness;
      green = maxBrightness;
      blue = maxBrightness;
    }
    else if (temperature >= 20)
    {
      red = maxBrightness - transition;
      green = maxBrightness;
      blue = maxBrightness;
    }
    else if (temperature >= 0)
    {
      green = maxBrightness - transition;
      blue = maxBrightness;
    }
    else {
      blue = maxBrightness;
    }
    return "rgb(" + red + ", " + green + ", " + blue + ")"
  }
}

function createResult(cookieData, bgColor, tempColor) {
  // 'results' contains the element that holds all recent search results.
  var results = document.getElementById("recent--searches");

  // Creates the wrapper that will hold all of the elements for each search
  // result and places this new result at the top of the list.
  var wrapper = document.createElement("div");
  wrapper.className = "recent--wrapper";
  if (results.childNodes[0] == null)
  {
    results.appendChild(wrapper);
  }
  else
  {
    results.insertBefore(wrapper, results.childNodes[0]);
  }

  // Creates the element that will hold the state abbreviation.
  var state = document.createElement("p");
  state.className = "state";
  state.innerHTML = cookieData[2]; // index 2 returns state.
  wrapper.appendChild(state);

  // Creates the temperature wrapper element.
  var temperatureWrapper = document.createElement("div");
  temperatureWrapper.className = "temp";
  temperatureWrapper.style.backgroundColor = tempColor;
  wrapper.appendChild(temperatureWrapper);

  // Creates the temperature value element that will go inside the temperature
  // wrapper element.
  var temperatureValue = document.createElement("p");
  temperatureValue.innerHTML = Math.round(cookieData[6]) + "&#176"; // index 6 returns temp
  temperatureWrapper.appendChild(temperatureValue);

  // Creates the element that will hold the city name.
  var city = document.createElement("p");
  city.className = "city";
  city.innerHTML = cookieData[1];  // index 1 returns city name
  wrapper.appendChild(city);

  var timestamp = document.createElement("p");
  timestamp.className = "timestamp";
  timestamp.innerHTML = getFormalTime(cookieData[0]);
  wrapper.appendChild(timestamp);

  // Creates the background for the result in the list.
  var bg = document.createElement("div");
  bg.className = "bg";
  bg.style.backgroundColor = bgColor;
  wrapper.appendChild(bg);

  wrapper.addEventListener("click", function() {
    document.getElementById("search--form-input").value = cookieData[1] + ", " + cookieData[2];
    document.getElementById("search--form-submit").click();
  });
}

// Retrieves the requested cookie's data.
function getCookie(cookieName) {
	// 'name' is the string to search for within document.cookie
	var name = cookieName + "=";
	// Replaces any special characters with what they represent.
	var decodedCookie = decodeURIComponent(document.cookie);
	// Create an array of all cookies by seperating them by semi-colons.
	var cookieSplit = decodedCookie.split(";");

	for (var i = 0; i < cookieSplit.length; i++)
	{
		var cookie = cookieSplit[i];

		// This while loop removes white space.
		while (cookie.charAt(0) == " ")
		{
			 // This removes the first character that the cookie array element
			 // contained (which is white space).
			cookie = cookie.substring(1);
		}
		// Searches for the specified cookie name within the cookie array element.
		// It will return -1 if nothing is found.
		if (cookie.indexOf(name) == 0)
		{
			// If the cookie name is found, return the value of the cookie.
			return cookie.substring(name.length, cookie.length);
		}
	}
	// If the cookie name is not found, return nothing.
	return "";
}
