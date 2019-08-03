// The 'style' var holds styling for each suggestion item.
// CSS elements are assigned to 'style' innerHTML.
var style = document.createElement("style");
// Then the style tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(style);

var codesWithColors = {
  clear: "rgb(27, 112, 224)",
  clouds: "rgb(177, 183, 189)",
  drizzle: "rgb(163, 207, 227)",
  rain: "rgb(80, 120, 145)",
  thunderstorm: "rgb(86, 102, 95)",
  snow: "rgb(242, 242, 242)",
  mist: "rgb(135, 160, 212)",
  fog: "rgb(89, 111, 124)",
  default: "rgb(35, 161, 79)"
}

window.addEventListener("load", function() {
  var cookies = splitCookies();
  var index = cookies.length;
  var color = "";
  var done = false;

  while(!done)
  {
    index -= 1;
    var data = splitCookieData(cookies[index]);
    console.log(data[0]);

    if (index == 0)
    {
      done = true;
    }
    else
    {
      switch (data[3])
      {
        case "Clear":
          color = codesWithColors.clear;
          break;
        case "Clouds":
          color = codesWithColors.clouds;
          break;
        case "Drizzle":
          color = codesWithColors.drizzle;
          break;
        case "Rain":
          color = codesWithColors.rain;
          break;
        case "Thunderstorm":
          color = codesWithColors.thunderstorm;
          break;
        case "Snow":
          color = codesWithColors.snow;
          break;
        case "Mist":
          color = codesWithColors.mist;
          break;
        case "Fog":
          color = codesWithColors.fog;
          break;
        default:
          color = codesWithColors.default;
      }
        createResult(data, color);
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

document.getElementById("search--form-submit").addEventListener("click", function(event) {
  console.log(event);
});

window.addEventListener("resize", function() {
  console.log("Window height changed to " + window.innerHeight);

  var viewportHeight = window.innerHeight;
  var occupiedSpace = 60 + 20 + 20;
  console.log(viewportHeight);

  style.innerHTML +=
  "#recent--searches {" +
    "height: " + (viewportHeight - occupiedSpace) + "px;" +
  "}";
});

document.getElementById("nav--recent").addEventListener("click", function() {
  document.getElementById("recent").className = "";
});

document.getElementById("recent--close").addEventListener("click", function() {
  document.getElementById("recent").className = "collapsed";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieSplit = decodedCookie.split(";");

  console.log(cookieSplit[cookieSplit.length - 1]);
  console.log(window.innerHeight);
});

/*function allocateResultSpace() {

}*/

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

function createResult(cookieData, color) {
  // 'results' contains the element that holds all recent search results.
  var results = document.getElementById("recent--searches");

  // Creates the wrapper that will hold all of the elements for each search
  // result and places this new result at the top of the list.
  var wrapper = document.createElement("div");
  wrapper.className = "recent--wrapper";
  results.appendChild(wrapper);

  // Creates the element that will hold the state abbreviation.
  var state = document.createElement("p");
  state.className = "state";
  state.innerHTML = cookieData[2]; // index 2 returns state.
  wrapper.appendChild(state);

  // Creates the temperature wrapper element.
  var temperatureWrapper = document.createElement("div");
  temperatureWrapper.className = "temp";
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

  // Creates the background for the result in the list.
  var bg = document.createElement("div");
  bg.className = "bg";
  bg.style.backgroundColor = color;
  wrapper.appendChild(bg);
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
