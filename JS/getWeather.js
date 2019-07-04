// This sets the path to the PHP files.
var phpPath = "./PHP/";

// If cookies are enabled, this will generate a test cookie to ensure that cookies are enabled.
if (document.cookie.indexOf("=") == -1)
{
	setCookie("test", ".", 1440);
}

// Count is used simply to limit how many event listeners are added to 'form'
var count = 0;

document.getElementById("header--weather-form-submit").onclick = function() {
	count++;

	// This if statement prevents multiple event listeners from being added.
	// If multiple event listeners are added, the amount of api calls made will double with each search.
	if (count == 1)
	{
	formSubmitEvent("header--weather-form");
	}

	// The entire front-end process of handling the submission is done by formSubmit.
	// It's all condensed into one function in order to be used by formSubmitEvent.
	// Note that all of this is for the city name form submission and isn't geolocation related.
	function formSubmit(event) {
		event.preventDefault(); // This prevents the page from being redirected to the php page.

		var input = document.getElementById("header--weather-form-input").value.toLowerCase(); // Input wont be valid if it contains any uppercase letters.
		var searchUrl = getSearchUrl(input);

		// First, search the city list for a match.
		searchCityList(searchUrl, function(cityCallback) {
			var city = cityCallback;

			if (city[0] != undefined)
			{
				var keyurl = phpPath + "getKey.php?cityInput=" + city[0].name + "&stateInput=" + city[0].state;

				// This replaces the user's input with a capitalized city name and state.
				document.getElementById("header--weather-form-input").value = city[0].name + ", " + city[0].state;

				requestKey(keyurl, function(keyCallback) {
					var key = keyCallback;
					var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + city[0].coord.lat + "&lon=" + city[0].coord.lon + "&appid=" + key;

					cookieHandler(key, city, url);
				})
			}
			else
			{
				setError(false, "City not found.")
			}
		});
	}

	function formSubmitEvent(formID) {
		document.getElementById(formID).addEventListener("submit", formSubmit)
	}
}


// Note that TTL (Time To Live) is based off of minutes, not seconds.
function setCookie(name, value, TTL) {
	var date = new Date();
	date.setTime(date.getTime() + (TTL * 60 * 1000)); // Expire time is 10 minutes.
	var expires = "expires=" + date.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Retrieves the requested cookie's data.
function getCookie(cookie_name) {
	var name = cookie_name + "="; // String to search for in document.cookie
	var decoded_cookie = decodeURIComponent(document.cookie); // Replaces any special characters with what they represent.
	var cookie_array = decoded_cookie.split(";"); // Create an array of all cookies by seperating them by semi-colons.
	for (var i = 0; i < cookie_array.length; i++)
	{
		var cookie = cookie_array[i];
		while (cookie.charAt(0) == " ") // This while loop removes white space.
		{
			cookie = cookie.substring(1); // This removes the first character that the cookie array element contained (which is white space).
		}
		if (cookie.indexOf(name) == 0) // Searches for the specified cookie name within the cookie array element. It will return -1 if nothing is found.
		{
			return cookie.substring(name.length, cookie.length); // If the cookie name is found, return the value of the cookie.
		}
	}
	return ""; // If the cookie name is not found, return nothing.
}

// Gets a response from getKey.php.
// This response can either give the api key, or it can say to reuse an old cookie.
function requestKey(url, keyCallback)
{
	var reqkey = new XMLHttpRequest();
	reqkey.open("GET", url, true); // url = "getKey/php?cityInput=" + city + "&stateInput=" + state;
	reqkey.onreadystatechange = function () {
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
				return keyCallback(this.responseText);
			}
		}
	}
	reqkey.send();
}

// Output is an array of objects from US_city_list_complete.
function searchCityList(url, cityCallback) {
	//var url = "citySearch.php?cityInput=" + cityInput + "&stateInput=" + stateInput;
	var request = new XMLHttpRequest();
	request.open("GET", url, true); // url = "citySearch.php?cityInput=" + cityInput + "&stateInput=" + stateInput;
	request.onreadystatechange = function() {
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
				// this.responseText will be an array with just one element.
				// That one element will be the city's data (not the city's weather data)
				var result = this.responseText;
				cityCallback(JSON.parse(result));
			}
		}
	}
	request.send();

}

// This function creates/manages all cookies related to openweathermap data.
function cookieHandler(key, city, url) {
	// Request a new key if a cookie for the city doesn't exist
	if (key != "Use Cookie" && key != "Cookies Disabled" && key != "Invalid")
	{
		// Once the url is retreived and the cookie has expired, the next request will take place.
		// This request gets the JSON data from the url.
		getWeather(url, function(callback) {
			var apidata = callback;

			// All spaces within the city name are replaced with underscores.
			// This is necessary because cookie names with spaces don't seem to be usable.
			cityName = city[0].name.toLowerCase().replace(" ", "_");

			var cookieName = cityName + "_" + city[0].state.toLowerCase() + "_data";

			var date = new Date();
			var timestamp = date.getTime();

			setCookie(cookieName, timestamp + "|"
			+ apidata.name + "|"
			+ city[0].state + "|"
			+ apidata.weather[0].main + "|"
			+ apidata.weather[0].description + "|"
			+ (apidata.main.pressure * 0.7500616827).toPrecision(4) + "|"  // A hpa to mm Hg conversion.
			+ ((apidata.main.temp - 273.15) * (9/5) + 32).toFixed(1) + "|"  // A Kelvin to Fahrenheit conversion.
			+ apidata.main.humidity + "|"
			+ apidata.coord.lat + "|"
			+ apidata.coord.lon, 10);

			var cookie = getCookie(cookieName);
			console.log("New Cookie: " + cookie);

			var cookie_array = cookie.split("|");	// The data within cookie_array is in order as follows:
																						// [0]: Timestamp in seconds since Jan 1, 1970.
			displayData(cookie_array);						// [1]: City Name
																						// [2]: State
																						// [3]: Current Weather Conditions
																						// [4]: Description of Current Weather Condition
																						// [5]: Barometric pressure
																						// [6]: Temperature (Fahrenheit)
																						// [7]: Humidity (in percentage)
																						// [8]: Latitude
																						// [9]: Longitude
		});
	}
	// Instead of calling openweathermap, we can use data that was already obtained if a cookie for the city already exists.
	else if (key === "Use Cookie")
	{
		// All spaces within the city name are replaced with underscores.
		// This is necessary because cookie names with spaces don't seem to be usable.
		var cityName = cleanInput(city[0].name).replace(" ", "_");
		var state = cleanInput(city[0].state);
		var cookieName = cityName + "_" + state + "_data";
		var data = getCookie(cookieName);
		var cookie_array = data.split("|");

		console.log("Cookie used. Cookie name: " + cookieName);

		displayData(cookie_array);

		setError(true);
	}
	// This displays when no cookies are set.
	else if (key == "Cookies Disabled")
	{
		setError(false, "Cookies are disabled. In order to use this tool, you must enable cookies and refresh the page.");
	}
}

// Retrieve weather data from openweathermap API.
// url = "https://api.openweathermap.org/data/2.5/weather?lat=" + cityInfo[0].coord.lat + "&lon=" + cityInfo[0].coord.lon + "&appid=" + keyResponse;
function getWeather(url, callback)	{
	var reqdata = new XMLHttpRequest();
	reqdata.open("GET", url, true);
	reqdata.onreadystatechange = function () {
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
				callback(JSON.parse(reqdata.responseText));
			}
			// Error handling for status other than 200.
			else
			{
				console.log("When attempting to retreive weather data, an error occured. Status code: " + this.status);
				if (this.status == 0)
				{
					setError(false, "No internet connection.");
				}
			}
		}
	}
	reqdata.send();
}


// This loops through and fills all HTML DOM elements that hold weather data.
function displayData(cookie_array) {
	var id = ["time", "city", "state", "weather", "weatherDesc", "pressure", "temp", "humidity", "lat", "lon"];

	// Replaces the getTime() value with a more useful and readable one.
	cookie_array[0] = timeSince(cookie_array[0]);
	cookie_array[5] = cookie_array[5] + " mm Hg";
	cookie_array[6] = cookie_array[6] + " F&#176;";
	cookie_array[7] = cookie_array[7] + "%";

	for (var i = 0; i < cookie_array.length; i++)
	{
		document.getElementById(id[i]).innerHTML = cookie_array[i];
	}
}

function timeSince(cookieTime) {
	var date = new Date();
	var current = date.getTime();

	// This stores how much time has passed in seconds since last call.
	var elapsed = (current - cookieTime) / 1000;

	var minutes = Math.floor(elapsed / 60);
	var seconds = Math.floor(elapsed % 60);

	if (minutes > 1)
	{
		return minutes + " minutes ago."
	}
	else if (seconds > 10)
	{
		return seconds + " seconds ago."
	}
	else
	{
		return "Just now."
	}
}

// This creates a url that will be used to call citySearch.php
function getSearchUrl(inputstr) {
	// if there is a comma delimiter within the input string...
	if (inputstr.search("," != -1))
	{
		// Split up the input into an array to fill the state and city variables.
		// The limit is set to 3 so that no garbage collects in the second array element (in case more commas were added after state)
		var inputArray = inputstr.split(",", 3);
		var city = inputArray[0];
		var state = inputArray[1];
	}
	else
	{
		var city = inputstr;
		var state = null;
	}

	if (state != null)
	{
		// returns the url used for searchCityList
		return phpPath + "citySearch.php?cityInput=" + city + "&stateInput=" + state;
	}
	else
	{
		// keyurl not given since state is required for the cookie system to work.
		return phpPath + "citySearch.php?cityInput=" + city;
	}
}

// Removes extra spaces or apostrophe's at the end and beginning of a string.
function cleanInput(str) {
	var input = str.toLowerCase();

	// Checks for any extra characters at the end of the input.
	while (input.charAt(input.length) == " " || input.charAt(input.length) == "'")
	{
		input = input.slice(0, input.length - 1);
	}

	// Checks for any extra characters at the beginning of the input.
	while (input.charAt(0) == " " || input.charAt(0) == "'")
	{
		input = input.slice(1, input.length);
	}

	return input;
}

// Sets the output for errors.
// 'success' is either true or false.
// 'errormsg' is a string. By default, it's blank unless otherwise set.
function setError(success, errormsg = "")
{
	if (success)
	{
		// Ideally I want a clean look to the page, so the errorbar will only be used when an error occurs.
		document.getElementById("error").innerHTML = "";
	}
	else
	{
		document.getElementById("error").innerHTML = errormsg;
		console.log(errormsg);
	}
}
