var matches = new Matches();

$(document).ready(function() {
	//localStorage.setItem('access_token', 'BQC2A-gSn4w490gtaEE0CL5JNf8iqyIbAnK0EywJJLd4-DMvHHdGs8oJaEPjLkKkSPdZBhmHEHTZeSctUxjCIrwRxTWM15DFLbutD-Kq-8JXh25ipvEuHMLAPqNGkpBq-KfFHrHHyEayPCouWAcuW8JPb4X3jcGwkZocftZ-zj_IBM4YWm4vtvPN0U-5tTXiZq8');
	
	$('#access_token').html(localStorage.getItem('access_token'));
	$('#refresh_token').html(localStorage.getItem('refresh_token'));
	
	var progress = new Progress(
		function() {
			$('#progress').html('Crunching your playlists (' + progress.completed + ' / ' + progress.queue + ')');
		},
		function() {
			$('#ready').html('Done!');
			matches.sort();
			console.log(matches);
		}
	);
		
	getCurrentUser(progress);

	//getPublicPlaylistIds('id', progress);
});



/**
 * Basic constructor for a new Track
 * @param {string} trackId - The track's id
 */
function Track(trackId) {
	this.trackId = trackId;
	this.userIds = [];
};

/**
 * Add a user to this track
 * @param {string} userId - The id of the user to add
 */
Track.prototype.addUser = function(userId) {
	if(this.userIds.indexOf(userId) === -1) {
		this.userIds.push(userId);
	}
};

/**
 * Get the amount of users who added this track
 * @returns {number} The amount of users who added this track
 */
Track.prototype.getUserCount = function() {
	return this.userIds.length;
};



/**
 * Basic constructor for a new artist
 * @param {string} artistId - the artist's id
 */
function Artist(artistId) {
	this.artistId = artistId;
	this.tracks = [];
	this.userIds = [];
};

/**
 * Add a track to this artist
 * @param {string} trackId - the id of the track to add
 * @param {string} userId - the id of the user adding the track
 */
Artist.prototype.addTrack = function(trackId, userId) {
	
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
Artist.prototype.getTrackCount = function(trackId) {
	for(var i = 0; i < this.tracks.length; i++)
		if(this.tracks[i].trackId === trackId)
			return this.tracks[i].getUserCount();
	return 0;
};
	
/**
 * Add a user to this artist
 * @param {string} userId - the id of the user to add
 */
Artist.prototype.addUser = function(userId) {
	if(this.userIds.indexOf(userId) === -1) {
		this.userIds.push(userId);
	}
};
	
/**
 * Get the amount of users who added this artist
 * @returns {number} The amount of users who added this artist
 */
Artist.prototype.getUserCount = function() {
	return this.userIds.length;
};

/**
 * Sort the artist's tracks by how many users added them, in decreasing order
 */
Artist.prototype.sort = function() {
	this.tracks = this.tracks.sort(function(a, b) {
		return b.userIds.length - a.userIds.length;
	});
};



/**
 * Keep track of the matching artists and tracks from users' playlists
 */
function Matches() {
	this.artists = [];
}

/**
 * Add a artist and track
 * @param {string} artistId - The id of the track's artist
 * @param {string} trackId - The id of the track to be added
 * @param {string} userId - The id of the user adding the track 
 */
Matches.prototype.add = function(artistId, trackId, userId) {
	
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
Matches.prototype.getArtist = function(artistId) {
	for(var i = 0; i < this.artists.length; i++) {
		if(this.artists[i].artistId === artistId) {
			return this.artists[i];
		}
	}
	return null;
};

/**
 * Sort the artists by how many users added them, in decreasing order
 */
Matches.prototype.sort = function() {
	this.artists = this.artists.sort(function(a, b) {
		return b.getUserCount() - a.getUserCount();
	});
	for(var i = 0; i < this.artists.length; i++) {
		this.artists[i].sort();
	}
};



/**
 * Keep track of the progress of a process
 * @param {function} update - The function to call every time a task in the queue is completed
 * @param {function} finished - The function to call when all tasks in the queue are completed
 */
function Progress(update, finished) {
	this.queue = 0;
	this.completed = 0;
	this.update = update;
	this.finished = finished;
};

/**
 * Add a new task to be completed
 */
Progress.prototype.add = function() {
	this.queue++;
};

/**
 * Complete a task, call the update() function, and call the finished() function if all tasks are completed
 */
Progress.prototype.complete = function() {
	this.completed++;
	this.update();
	if(this.queue === this.completed) {
		this.finished();
	}
};



/**
 * Get the current user's id and call getPublicPlaylistIds()
 */
function getCurrentUser(progress) {
	spotifyGet('https://api.spotify.com/v1/me', function(data) {
		getPublicPlaylistIds(JSON.parse(data['responseText'])['id'], progress);
	});
}

/**
 * Add each track in the playlist to matches
 */
function crunchPlaylist(userId, playlistId, progress) {
	spotifyGet(
		'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId, 
		
		// Playlist found
		function(data) {
			var tracks = JSON.parse(data['responseText'])['tracks']['items'];
			for(var i = 0; i < tracks.length; i++) {
				var trackId = tracks[i]['track']['id'];
				var trackArtists = tracks[i]['track']['artists'];
				for(var j = 0; j < trackArtists.length; j++) {
					matches.add(trackArtists[j]['id'], trackId, userId);
				}
			}
			progress.complete();
		},
		
		// Playlist not found
		function(data) {
			progress.complete();
		}
	);
}

/**
 * Get a user's playlists by their id
 * @param {string} userId - The id of the user whose public playlists to get
 */
function getPublicPlaylistIds(userId, progress) {
	spotifyGet('https://api.spotify.com/v1/users/' + userId + '/playlists?limit=50', function(data) {
		var playlists = JSON.parse(data['responseText'])['items'];
		for(var i = 0; i < playlists.length; i++) {
			progress.add();
			crunchPlaylist(userId, playlists[i]['id'], progress);
		}
	});
}

/**
 * Send a GET request for some data to Spotify, and execute a function on the response
 * @param {string} url - The url to GET from Spotify
 * @param {function} callback - The function to execute on a response, if it is correct
 * @param {function} error - The function to call on an incorrect response
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
				error(data);
			}
		}
	});
}