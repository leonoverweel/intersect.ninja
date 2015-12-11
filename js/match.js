$(document).ready(function() {
	localStorage.setItem('access_token', 'BQCkHigmfeSD7Nri2TEc2QeK9oFdwG9Ocm-qhKnYHBTz6q3W5EC9HoO5KgluqicYpEIbCXt3REPEWWEzZZe3f_ZkuIycLizsaYiaS1bN_V5nyroyr9hq4WB8Qm9N2Db2bZSRJ3HCn8m7LJYD8cPLN5FHFL-6U-svQwjFceIQix7lbrtd35hLSqqPZyV_Jo3GYLE');
	
	$('#access_token').html(localStorage.getItem('access_token'));
	$('#refresh_token').html(localStorage.getItem('refresh_token'));
	
	getCurrentUser();
});

/**
 * Get the current user's id and call getPublicPlaylists()
 */
function getCurrentUser() {
	spotifyGet('https://api.spotify.com/v1/me', function(data) {
		getPublicPlaylistIds(JSON.parse(data['responseText'])['id']);
	});
}

/**
 * Get a user's playlists by their id
 * @param {string} userId - The id of the user whose public playlists to get
 */
function getPublicPlaylistIds(userId) {
	spotifyGet('https://api.spotify.com/v1/users/' + userId + '/playlists', function(data) {
		var playlists = JSON.parse(data['responseText'])['items'];
		for(var i = 0; i < playlists.length; i++) {
			console.log(playlists[i]['id']);
		}
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