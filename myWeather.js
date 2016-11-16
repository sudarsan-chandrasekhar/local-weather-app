$(document).ready(function () {
  getWeather();

  // add a spinner icon to areas where data will be populated
  $('#weather-conditions').html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
  $('#wind').html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
});

// Array for autocomplete cities and their weather stations
var cities = [];

// Get the weather from the Weather Underground API
function getWeather(weatherStation) {
	   var backgroundImgUrl= 'https://sudarsan-chandrasekhar.github.io/local-weather-app/img/'
	   
	   apiBaseUrl = 'https://api.wunderground.com/api/d7ce33186a370045/conditions';

  // Build the appropriate URL if a specific city's weather station was requested.
  if (!weatherStation) {
    weatherApi = apiBaseUrl + '/q/autoip.json';
  } else {
    weatherApi = apiBaseUrl + weatherStation + '.json';
  }

  // Call the API
  $.getJSON(weatherApi).done(function (json) {
    var weatherData = json.current_observation,
        locData = weatherData.display_location,
        weatherConditions = weatherData.weather,
        wind = Number((weatherData.wind_mph * 0.86897624190816).toFixed(1)), //mph to knots
        windDir = weatherData.wind_dir;

    // Values for the convert button
    tempF = weatherData.temp_f,
    tempC = weatherData.temp_c;

    // If location has a value for "state", use it, otherwise use: city, country.
    if (locData.state !== '') {
      $('#city').text(locData.city + ', ' + locData.state + ', ' + locData.country_iso3166);
    } else {
      $('#city').text(locData.city + ', ' + locData.country_iso3166);
    }

    // categorize weather conditions to determine background image and icons
    switch (true) {
      case /thunderstorm|hail/i.test(weatherConditions):
        display = 'Thunderstorms';
      break;
      case /drizzle|light rain/i.test(weatherConditions):
        display = 'sprinkle';
      break;
      case /rain|squalls|precipitation/i.test(weatherConditions):
        display = 'Rain';
      break;
      case /snow|ice|freezing/i.test(weatherConditions):
        display = 'snow';
      break;
      case /overcast|mist|fog|smoke|haze|spray|sand|dust|ash/i.test(weatherConditions):
        display = 'fog-03';
      break;
      case /cloud/i.test(weatherConditions):
        display = 'cloudy_skies';
      break;
	  case /clear/i.test(weatherConditions):
		display = 'clear-skies';
	  break;
      default:
        display = 'clear_sky_night';
        if (!weatherConditions) weatherConditions = 'clear_sky_night'; // handle undefined cases
      break;
    }

    // Update background, wind speed, and icons based on weather conditions
    $('body').css('background-image', 'url(' + backgroundImgUrl + display + '.jpg)');
    if (display === 'clear') {
      $('#weather-conditions').html(
        '<i class="wi wi-night-' + display + '"></i><br><span class="description">' +
         weatherConditions + '</span>'
       );
    } else {
      $('#weather-conditions').html(
        '<i class="wi wi-' + display + '"></i><br><span class="description">' +
        weatherConditions + '</span>'
      );
    }

    $('#wind').html(
      '<i class="wi wi-wind wi-from-' + windDir.toLowerCase() + '"></i>' +
      '<br><span class="description">' + windDir + ' ' + wind + ' knots</span>'
    );

    //determine F or C based on country and add temperature to the page.
    var fahrenheit = ['US', 'BS', 'BZ', 'KY', 'PL'];
    if (fahrenheit.indexOf(locData.country_iso3166) > -1) {
      $('#temperature').text(tempF + '° F');
    } else {
      $('#temperature').text(tempC + '° C');
    }

    // Scroll to the top of the page and remove focus from the
    // search field to hide the keyboard on mobile
    scroll(0, 0);
    $('#search-field').blur();

  }).fail(function (err, json) {
    alert('There was an error retrieving your weather data. \n' +
          'Please try again later or try a different city.');
  });
}


//toggle between celsius / fahrenheit
$('#convert-button').click(function () {
  this.blur(); // remove focus from the button after click
  if ($('#temperature').text().indexOf('F') > -1) {
    $('#temperature').text(tempC + '° C');
  } else {
    $('#temperature').text(tempF + '° F');
  }
});

$('#search-field').click(function () {
  $(this).val('');
  $('#search').autocomplete('close');
});