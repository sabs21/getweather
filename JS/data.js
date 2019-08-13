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

// We will work on the elements from left to right.
// First, lets add an event to detect when to pull data from document.cookie
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

// On window resize, adjusts the spacing of the notches for the highLow bar.
/*window.addEventListener("resize", function() {

});*/

function displayData(cookieSplit)
{
  var id = ["time", "city", "state", "weather", "weatherDesc", "pressure", "temp", "humidity", "clouds", "lat", "lon"];
  var idPrefix = "data--value-";

	// Replaces the getTime() value with a more useful and readable one.
	//cookieSplit[0] = timeSince(cookieSplit[0]);
	//cookieSplit[5] = cookieSplit[5] + " mm Hg";
	cookieSplit[6] = cookieSplit[6] + "&deg;F";
  cookieSplit[7] = "Humidity: " + cookieSplit[7] + "%";
  cookieSplit[5] = "Pressure: " + cookieSplit[5] + " mm Hg";
  cookieSplit[8] = "Cloudiness: " + cookieSplit[8] + "%";
	//cookieSplit[7] = cookieSplit[7] + "%";

	//for (var i = 0; i < cookieSplit.length; i++)
	//{
    document.getElementById(idPrefix + "address").innerHTML = cookieSplit[1] + ", " + cookieSplit[2];
    document.getElementById(idPrefix + id[5]).innerHTML = cookieSplit[5];
		document.getElementById(idPrefix + id[6]).innerHTML = cookieSplit[6];
    document.getElementById(idPrefix + id[7]).innerHTML = cookieSplit[7];
    document.getElementById(idPrefix + id[8]).innerHTML = cookieSplit[8];
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
