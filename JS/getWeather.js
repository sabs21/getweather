// This sets the path to the PHP files.
var phpPath = "./PHP/";

// If cookies are enabled, this will generate a test cookie to ensure that cookies are enabled.
if (document.cookie.indexOf("=") == -1)
{
	setCookie("test", ".", 1440);
}

document.getElementById("search--form").addEventListener("submit", formSubmit);

// The entire front-end process of handling the submission is done by formSubmit.
// It's all condensed into one function in order to be used by formSubmitEvent.
// Note that all of this is for the city name form submission and isn't geolocation related.
function formSubmit(event) {
	// 'preventDefault' prevents PHP from redirecting the page.
	event.preventDefault();

	// Note: An input is invalid if it contains any uppercase letters.
	var input = document.getElementById("search--form-input").value.toLowerCase();
	var searchUrl = getSearchUrl(input);

	// First, search the city list for a match.
	searchCityList(searchUrl, function(callback) {
		// When the form is submitted, whether by hitting enter or clicking on a
		// suggestion, the top-most suggestion will be used to search through the
		// city list.
		var city = callback[0];

		if (city != undefined)
		{
			var keyurl = phpPath + "getKey.php?cityInput=" + city.name + "&stateInput=" + city.state;

			// This replaces the user's input with a capitalized city name and state.
			document.getElementById("search--form-input").value = city.name + ", " + city.state;

			requestKey(keyurl, function(callback) {
				var key = callback;
				var url = "https://api.openweathermap.org/data/2.5/weather?id=" + city.id + "&units=imperial" + "&appid=" + key;
				// Call by city ID.
			  //var url = "https://api.openweathermap.org/data/2.5/weather?id=" + city.id + "&appid=" + key;
				// Call by coordinates.
				//var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + city.coord.lat + "&lon=" + city.coord.lon + "&appid=" + key;

				cookieHandler(key, city, url);
			});
		}
		else
		{
			setError(false, "City not found.");
		}
	});
}

// Note that TTL (Time To Live) is based off of minutes, not seconds.
function setCookie(name, value, TTL) {
	var date = new Date();
	date.setTime(date.getTime() + (TTL * 60 * 1000)); // Expire time is 10 minutes.
	var expires = "expires=" + date.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
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

// Output is an array of objects from US_city_list_complete.
function searchCityList(url, callback) {
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
				callback(JSON.parse(result));
			}
		}
	}
	request.send();
}

// Gets a response from getKey.php.
// This response can either give the api key, or it can say to reuse an old cookie.
function requestKey(url, callback)
{
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function () {
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
				return callback(this.responseText);
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
			city.name = city.name.toLowerCase().replace(" ", "_");

			var cookieName = city.name + "_" + city.state.toLowerCase() + "_data";

			var date = new Date();
			var timestamp = date.getTime();

			setCookie(cookieName, timestamp + "|"
			+ apidata.name + "|"
			+ city.state + "|"
			+ apidata.weather[0].main + "|"
			+ apidata.weather[0].description + "|"
			+ (apidata.main.pressure * 0.7500616827).toPrecision(4) + "|"  // A hpa to mm Hg conversion.
			+ apidata.main.temp.toFixed(1) + "|"
			+ apidata.main.humidity + "|"
			+ apidata.coord.lat + "|"
			+ apidata.coord.lon, 10);

			var cookie = getCookie(cookieName);
			console.log("New Cookie: " + cookie);

			document.getElementById("recent--addResult").click();

			var cookieSplit = cookie.split("|");	// The data within cookieSplit is in order as follows:
																						// [0]: Timestamp in seconds since Jan 1, 1970.
			displayData(cookieSplit);							// [1]: City Name
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
		city.name = cleanInput(city.name).replace(" ", "_");
		city.state = cleanInput(city.state);
		var cookieName = city.name + "_" + city.state + "_data";
		var data = getCookie(cookieName);
		var cookieSplit = data.split("|");

		console.log("Cookie used. Cookie name: " + cookieName);
		document.getElementById("recent--addResult").click();

		//displayData(cookieSplit);

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
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function () {
		if (this.readyState == 4)
		{
			if (this.status == 200)
			{
				callback(JSON.parse(request.responseText));
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
	request.send();
}


// This loops through and fills all HTML DOM elements that hold weather data.
/*function displayData(cookieSplit) {
	var id = ["time", "city", "state", "weather", "weatherDesc", "pressure", "temp", "humidity", "lat", "lon"];

	// Replaces the getTime() value with a more useful and readable one.
	//cookieSplit[0] = timeSince(cookieSplit[0]);
	cookieSplit[5] = cookieSplit[5] + " mm Hg";
	cookieSplit[6] = cookieSplit[6] + " F&#176;";
	cookieSplit[7] = cookieSplit[7] + "%";

	for (var i = 0; i < cookieSplit.length; i++)
	{
		document.getElementById(id[i]).innerHTML = cookieSplit[i];
	}
}*/

/*function timeSince(cookieTime) {
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
}*/

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
