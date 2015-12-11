$(document).ready(function() {
	$('#access_token').html(localStorage.getItem('access_token'));
	$('#refresh_token').html(localStorage.getItem('refresh_token'));
	
	getCurrentUser();
});

function getCurrentUser(username) {
	spotifyGet('https://api.spotify.com/v1/me', function(data) {
		console.log(JSON.stringify(data));
	});
}

/**
 * Send a GET request for some data to Spotify, and execute a function on the response
 * @param {string} url - The url to GET from Spotify
 * @param {function} callback - The function to execute on a response, if it is correct
 */
function spotifyGet(url, callback, error) {
	$.ajax({
		url: url,
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization','Bearer ' + localStorage.getItem('access_token')); 
		}, 
		complete: function(data) {
			
			// Execute callback if status code is 200
			if(data.status === 200) { callback(data); }
			
			// Reauthorize if access token incorrect
			else if(data.status === 401) { 
				// TO DO: reauthorization flow
				console.log("Authorization error");
			}
			
			// Log other errors
			else {
				console.log("Error getting " + url + "\nStatus text: " + data.statusText);
			}
		}
	});
}