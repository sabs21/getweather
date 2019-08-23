// This code is used for building the curved background for the data to sit in.
var canvas = document.getElementById("data--bg");
var draw = canvas.getContext("2d");
var maxWidth = canvas.offsetWidth;
var maxHeight = canvas.offsetHeight;
var column = canvas.offsetWidth / 3;
var halfColumn = column / 2;

// Setting canvas width and height manually is necessary
// for fixing the blurry line issue.
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

draw.fillStyle = "rgb(150, 160, 200)";
draw.strokeStyle = "rgb(150, 160, 200)";

draw.beginPath();
// 10 is subtracted to ensure the curve meets the screen edge.
draw.moveTo(-10, 0);
draw.arcTo(halfColumn, 40, column, 40, maxWidth * 2);
draw.lineTo(halfColumn * 3, 40);
draw.lineTo(halfColumn * 3, maxHeight);
draw.lineTo(0, maxHeight);
draw.lineTo(0, 0);

draw.fill();
draw.stroke();
draw.closePath();

draw.beginPath();
// 10 is added to ensure the curve meets the screen edge.
draw.moveTo(maxWidth + 10, 0);
draw.arcTo(halfColumn * 5, 40, column * 2, 40, maxWidth * 2);
draw.lineTo(halfColumn * 3, 40);
draw.lineTo(halfColumn * 3, maxHeight);
draw.lineTo(maxWidth, maxHeight);
draw.lineTo(maxWidth, 0);

draw.fill();
draw.stroke();
draw.closePath();

// Once the data is retrieved, the css will be edited accordingly for the .
// CSS elements are assigned to 'style' innerHTML.
var style = document.createElement("style");
// Then the style tag is appended to the head of the HTML document.
var ref = document.querySelector("head");
// Finally, we add the element to the HTML.
ref.appendChild(style);

// An event listener is added to this since it guarentees that the data is
// ready to be used.
var onCookieCreation = document.getElementById("recent--addResult");

onCookieCreation.addEventListener("click", function() {
  var cookies = splitCookies();
  var inputValue = document.getElementById("search--form-input").value;
  var tenMinutes = 600000;
  var d = new Date();
  var currentTime = d.getTime();

  for (var i = 1; i < cookies.length; i++)
  {
    var data = splitCookieData(cookies[i]);
    var address = data[1] + ", " + data[2];
    if (address == inputValue && (currentTime - data[0]) < tenMinutes)
    {
      displayData(data);
      i = cookies.length;
    }
  }
});

// This places the marker for the high/low temp bar in the correct position.
function getMarkerPos(high, low, currentTemp) {
  // First, parse each string for integers (the cookie data offers strings)
  var high = parseInt(high);
  var low = parseInt(low);
  var currentTemp = parseInt(currentTemp);

  // Next, find the difference between the min and max/current and max.
  var maxDifference = high - low;
  var currentDifference = high - currentTemp;

  // Finally return the percentage value to assign to the marker's 'left' value.
  return (currentDifference / maxDifference) * 100;
}

// This places the marker for the high/low temp bar.
function placeMarker(leftPercentage) {
style.innerHTML +=
"#data--highLow-marker {" +
  "left: " + leftPercentage + "%;" +
"}";
}

function displayData(cookieSplit)
{
  var id = ["time", "city", "state", "weather", "desc", "pressure",
  "temp", "high", "low", "humidity", "clouds", "speed", "deg",
  "sunrise", "sunset", "lat", "lon"];
  var idPrefix = "data--value-";

	// Replaces the getTime() value with a more useful and readable one.
	//cookieSplit[0] = timeSince(cookieSplit[0]);
	//cookieSplit[5] = cookieSplit[5] + " mm Hg";
	cookieSplit[6] = cookieSplit[6] + "&deg;F";
  cookieSplit[9] = "Humidity: " + cookieSplit[9] + "%";
  cookieSplit[5] = "Pressure: " + cookieSplit[5] + " mm Hg";
  if (cookieSplit[10] == 1)
  {
    cookieSplit[10] = "Cloudiness: 0%";
  }
  else
  {
    cookieSplit[10] = "Cloudiness: " + cookieSplit[10] + "%";
  }
  cookieSplit[4] = capitalize(cookieSplit[4]);

  // For the wind speed and direction
  cookieSplit[11] = cookieSplit[11] + " MPH";
  setGaugeNeedle(cookieSplit[12]);

  // For sunrise and sunset
  var sunriseTime = getFormalTime(cookieSplit[13], true);
  var sunsetTime = getFormalTime(cookieSplit[14], true);
  cookieSplit[13] = "Sunrise at " + sunriseTime;
  cookieSplit[14] = "Sunset at " + sunsetTime;

  /*
  // Remember, the array of data will be structured as follows:
  // [0]: Timestamp in seconds since Jan 1, 1970.
  // [1]: City Name
  // [2]: State
  // [3]: Current Weather Conditions
  // [4]: Description of Current Weather Condition
  // [5]: Barometric pressure
  // [6]: Temperature (Fahrenheit)
  // [7]: Temperature High (Fahrenheit)
  // [8]: Temperature Low (Fahrenheit)
  // [9]: Humidity (in percentage)
  // [10]: Cloudiness (in percentage) (if no clouds, result is 1)
  // [11]: Wind speed (in MPH)
  // [12]: Wind direction (in degrees)
  // [13]: Sunrise time
  // [14]: Sunset time
  // [15]: Latitude
  // [16]: Longitude
  */

  // Places the high/low temp meter's marker in the correct position.
  var markerPos = getMarkerPos(cookieSplit[7], cookieSplit[8], cookieSplit[6]);
  placeMarker(markerPos);

	//for (var i = 0; i < cookieSplit.length; i++)
	//{
    document.getElementById(idPrefix + id[0]).innerHTML = getFormalTime(cookieSplit[0]);
    document.getElementById(idPrefix + "address").innerHTML = cookieSplit[1] + ", " + cookieSplit[2];
    document.getElementById(idPrefix + id[4]).innerHTML = cookieSplit[4];
    document.getElementById(idPrefix + id[5]).innerHTML = cookieSplit[5];
		document.getElementById(idPrefix + id[6]).innerHTML = cookieSplit[6];
    document.getElementById(idPrefix + id[7]).innerHTML = cookieSplit[7];
    document.getElementById(idPrefix + id[8]).innerHTML = cookieSplit[8];
    document.getElementById(idPrefix + id[9]).innerHTML = cookieSplit[9];
    document.getElementById(idPrefix + id[10]).innerHTML = cookieSplit[10];
    document.getElementById(idPrefix + id[11]).innerHTML = cookieSplit[11];
    document.getElementById(idPrefix + id[13]).innerHTML = cookieSplit[13];
    document.getElementById(idPrefix + id[14]).innerHTML = cookieSplit[14];
	//}
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

function splitCookies() {
  // Replaces any special characters with what they represent.
  var decodedCookie = decodeURIComponent(document.cookie);
  // Create an array of all cookies by seperating them by semi-colons.
  var cookies = decodedCookie.split(";");
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
  // [7]: Temperature High (Fahrenheit)
  // [8]: Temperature Low (Fahrenheit)
  // [9]: Humidity (in percentage)
  // [10]: Cloudiness (in percentage) (if no clouds, result is 1)
  // [11]: Wind speed (in MPH)
  // [12]: Wind direction (in degrees)
  // [13]: Latitude
  // [14]: Longitude
  */
}

function getFormalTime(milliseconds = null, isSeconds = false) {
  var date = new Date();

  if (milliseconds != null)
  {
    if (isSeconds)
    {
      date.setTime(milliseconds * 1000);
    }
    else
    {
      date.setTime(milliseconds);
    }
    //console.log(milliseconds);
  }

  console.log(date);

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
  console.log("Timestamp: " + timestamp);
  return timestamp;
}

// Turns the wind gauge needle according to the current wind direction.
function setGaugeNeedle(deg) {
  style.innerHTML +=
  "#data--windGaugeNeedle {" +
    "transform: rotate(" + deg + "deg);" +
  "}";
}

function capitalize(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}
