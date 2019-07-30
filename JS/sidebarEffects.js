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
        case "clear":
          color = codesWithColors.clear;
          break;
        case "clouds":
          color = codesWithColors.clouds;
          break;
        case "drizzle":
          color = codesWithColors.drizzle;
          break;
        case "rain":
          color = codesWithColors.rain;
          break;
        case "thunderstorm":
          color = codesWithColors.thunderstorm;
          break;
        case "snow":
          color = codesWithColors.snow;
          break;
        case "mist":
          color = codesWithColors.mist;
          break;
        default:
          color = codesWithColors.default;
      }
    }
  }

  var viewportHeight = window.innerHeight;
  var occupiedSpace = 60 + 20 + 20;
  console.log(viewportHeight);

  style.innerHTML +=
  "#recent--searches {" +
    "height: " + (viewportHeight - occupiedSpace) + "px;" +
  "}";
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
