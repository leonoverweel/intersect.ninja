var matches = new Matches();

$(document).ready(function() {
	localStorage.setItem('access_token', 'BQCz1NOuDclHciVOwZbocWsCfgDWGqvT8CuE_f8l3oFEFv0W-RHPqDAU3EFuUMlqH1xjjvE8N5bgjWRg8jsHH1Z_df4gP6AzR9Xp4DNOw_lMHOOBD27oNeA13QRNd0XTdLEGjloGlX5d9WZLFfM55A4l6_eqE3xnC-Gn7AC2u1xeFpgSteSeh3WULJxUocZ3Yrg');
	
	$('#access_token').html(localStorage.getItem('access_token'));
	$('#refresh_token').html(localStorage.getItem('refresh_token'));
	
	getCurrentUser();
});

/**
 * Basic constructor for a new Track
 * @param {string} trackId - The track's id
 */
function Track(trackId) {
	this.trackId = trackId;
	this.userIds = [];
	
	/**
	 * Add a user to this track
	 * @param {string} userId - The id of the user to add
	 */
	
	this.addUser = function(userId) {
		if(this.userIds.indexOf(userId) === -1) {
			this.userIds.push(userId);
		}
	}
	
	/**
	 * Get the amount of users who added this track
	 * @returns {number} The amount of users who added this track
	 */
	this.getUserCount = function() {
		return this.userIds.length;
	}
};

/**
 * Basic constructor for a new artist
 * @param {string} artistId - the artist's id
 */
function Artist(artistId) {
	this.artistId = artistId;
	this.tracks = [];
	this.userIds = [];
	
	/**
	 * Add a track to this artist
	 * @param {string} trackId - the id of the track to add
	 * @param {string} userId - the id of the user adding the track
	 */
	this.addTrack = function(trackId, userId) {
		
		// Get the index of the track (if it's been added before)
		var index = -1;
		for(var i = 0; i < this.tracks.length; i++) {
			if(this.tracks[i].trackId === trackId) {
				index = i;
			}
		}
		
		// If the track is new, add it and add the user who added it
		if(index === -1) {
			var track = new Track(trackId);
			track.addUser(userId);
			this.tracks.push(track);
		}
		
		// If it already exists, just add the new user to the track
		else {
			this.tracks[index].addUser(userId);
		}
	};
	
	/**
	 * Get the number of users who have added this track
	 * @param {string} trackId - The id of the track to check
	 * @returns {number} The amount of users who have added this track
	 */
	this.getTrackCount = function(trackId) {
		for(var i = 0; i < this.tracks.length; i++)
			if(this.tracks[i].trackId === trackId)
				return this.tracks[i].getUserCount();
		return 0;
	}
	
	/**
	 * Add a user to this artist
	 * @param {string} userId - the id of the user to add
	 */
	this.addUser = function(userId) {
		if(this.userIds.indexOf(userId) === -1) {
			this.userIds.push(userId);
		}
	}
	
	/**
	 * Get the amount of users who added this artist
	 * @returns {number} The amount of users who added this artist
	 */
	this.getUserCount = function() {
		return this.userIds.length;
	}
}

/**
 * Keep track of the matching artists and tracks from users' playlists
 */
function Matches() {
	this.artists = [];
	
	/**
	 * Add a artist and track
	 * @param {string} artistId - The id of the track's artist
	 * @param {string} trackId - The id of the track to be added
	 * @param {string} userId - The id of the user adding the track 
	 */
	this.add = function(artistId, trackId, userId) {
		
		// Find the index of the artist, if they've been added before
		var index = -1;
		for(var i = 0; i < this.artists.length; i++) {
			if(this.artists[i].artistId === artistId) {
				index = i;
			}
		}
		
		// If they're new, add them, add the user, and add the track
		if(index === -1) {
			var artist = new Artist(artistId);
			artist.addUser(userId);
			artist.addTrack(trackId, userId);
			this.artists.push(artist);
		}
		
		// If they're already matched, just add the user and the track
		else {
			this.artists[index].addUser(userId);
			this.artists[index].addTrack(trackId, userId);
		}
	};
	
	/**
	 * Get an artist by their id
	 * @param {string} artistId - The id of the artist to get
	 * @returns {Artist} The artist
	 */
	this.getArtist = function(artistId) {
		for(var i = 0; i < this.artists.length; i++) {
			if(this.artists[i].artistId === artistId) {
				return this.artists[i];
			}
		}
		return null;
	};
}

/**
 * 
 */
function crunchPlaylist(userId, playlistId) {
	spotifyGet('https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId, function(data) {
		var tracks = JSON.parse(data['responseText'])['tracks']['items'];
		for(var i = 0; i < tracks.length; i++) {
			var trackId = tracks[i]['track']['id'];
			var trackArtists = tracks[i]['track']['artists'];
			for(var j = 0; j < trackArtists.length; j++) {
				
			}
		}
	});
}

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
		for(var i = 0; i < playlists.length; i++)
			crunchPlaylist(userId, playlists[i]['id']);
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