/**
 * GLOBAL VARIABLES
 */

var matches = new Matches();
var users = new Users();
var limitCurrent;
var limitDelta = 20;

// Progress function
var progress = new Progress(
	function() {
		$('#progress').html('crunching playlists (' + progress.completed + ' / ' + progress.queue + ')');
	},
	function() {
		matches.sort(
			'users', 'desc', [			// Main sort
				'tracks', 'desc',		// Tie breaker 1
				'name', 'asc'			// Tie breaker 2
			], 
			'users', 'desc', [			// Track main sort
				'name', 'asc'			// Track tie breaker 1
			]
		);
		$('#progress').html('ready');
		$('#show-more a').html('show more');
		console.log(matches);
	}
);

// Sorting
var sorting = {
	
	// Sort tracks by their length
	'length': function(a, b, order, ties) {
		return (order === 'asc') ? (a.length - b.length) : (b.length - a.length);
	},
	
	// Sort tracks or artists alphabetically by their name
	'name': function(a, b, order, ties) {
		var nameA = a.name.toLowerCase();
		var nameB = b.name.toLowerCase();
		if(nameA < nameB) {
			return (order === 'asc') ? -1 : 1;
		}
		else if(nameA > nameB) {
			return (order === 'asc') ? 1 : -1;
		}
		if(ties != null && Object.prototype.toString.call(ties) === '[object Array]' && ties.length > 1) {
			return sorting[ties[0]](a, b, ties[1], ties.slice(2));
		}
		return 0;
	},
	
	// Sort artists by how many tracks they have
	'tracks': function(a, b, order, ties) {
		var tracksA = a.tracks.length;
		var tracksB = b.tracks.length;
		if(tracksA != tracksB) {
			return (order === 'asc') ? (tracksA - tracksB) : (tracksB - tracksA);
		}
		if(ties != null && Object.prototype.toString.call(ties) === '[object Array]' && ties.length > 1) {
			return sorting[ties[0]](a, b, ties[1], ties.slice(2));
		}
		return 0;
	},
	
	// Sort artists or tracks by how many users added them
	'users': function(a,b, order, ties) {
		var countA = a.getUserCount();
		var countB = b.getUserCount();
		if(countA != countB) {
			return (order === 'asc') ? (countA - countB) : (countB - countA);
		}
		if(ties != null && Object.prototype.toString.call(ties) === '[object Array]' && ties.length > 1) {
			return sorting[ties[0]](a, b, ties[1], ties.slice(2));
		}
		return 0;
	}
};



/**
 * Start up the app
 */
$(document).ready(function() {

	// Authorization
	//localStorage.setItem('access_token', 'BQDu7Xkje7Ac1iVljpPBUF-FduUdB8a4g-aLVyQh8hCRfirvGjBnKdDDfdiI3maKx6JZ6ISGSkqST1XyinO1vhGklQy_qyhaQsQVrQ3UN37P6vI4QxBRIqcRf0KLIdZvH2gYt8NRPKkaaUQb7xipF9_XdJplBnjm5hoy7yRzHKD-bK29-pEjJikNJaY4FryDFp0');
	console.log('Access token: ' + localStorage.getItem('access_token'));
	console.log('Refresh token: ' + localStorage.getItem('refresh_token'));
	
	// Get the current user;
	getCurrentUser(progress);
});



/**
 * FUNCTIONS
 */



/**
 * Add each track in the playlist to matches
 */
function crunchPlaylist(userId, playlistId, progress) {
	spotifyGet(
		'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId, 
		
		// Playlist found
		function(data) {
			var tracks = JSON.parse(data['responseText'])['tracks']['items'];

			// Add the playlist to the user if it doesn't exist
			var user = users.get(userId);
			if(user.getPlaylist(playlistId) === null) {
				user.addPlaylist(playlistId, JSON.parse(data['responseText']).name);
			}

			// If the playlist is active, crunch it
			if(user.getPlaylist(playlistId).active === true) {
				
				// Loop through playlist tracks
				for(var i = 0; i < tracks.length; i++) {
					
					// Get track id
					var trackId = tracks[i]['track']['id'];
					
					// Loop through the track's artists
					var trackArtists = tracks[i]['track']['artists'];
					for(var j = 0; j < trackArtists.length; j++) {
						
						// Make sure there are no null ids
						if(trackArtists[j]['id'] != null && trackId != null) {
							
							// Add the track and song
							matches.add(trackArtists[j]['id'], trackId, userId);
							
							// Add the artist data
							var artist = matches.getArtist(trackArtists[j]['id']);
							artist.name = trackArtists[j]['name'];
							
							// Add the track data
							var track = artist.getTrack(trackId);
							track.name = tracks[i]['track']['name'];
							track.length = tracks[i]['track']['duration_ms'];
						}
					}
				}
			}
			
			// Complete
			progress.complete();
		},
		
		// Playlist not found
		function(data) {
			progress.complete();
		}
	);
};

/**
 * Display an Artist's info
 * @param {string} artistId - The ID of the Artist whose info to display
 */
function displayArtistInfo(artistId) {
	
	// If the artist's info is already displayed, remove it
	var existing = document.getElementById('i-' + artistId);
	if(existing !== null) {
		existing.remove();
		return;
	}
	
	spotifyGet('https://api.spotify.com/v1/artists/' + artistId, function(response) {	
		var artist = matches.getArtist(artistId);
		var data = JSON.parse(response['responseText']);
		
		// Create the row
		var row = document.createElement('tr');
		row.setAttribute('id', 'i-' + artistId);
		
		// Create the cell
		var col = document.createElement('td');
		col.setAttribute('class', 'a-cell');
		col.setAttribute('colspan', '3');
		
		// Create the header
		var name = document.createElement('h2');
		name.appendChild(document.createTextNode(data['name']));
		
		// Create the image
		if(data['images'].length > 0) {
			var img = document.createElement('img');
			var index; (data['images'].length >= 2) ? index = 2 : index = (data['images'][data['images'].length - 1]);
			img.setAttribute('src', data['images'][index]['url']);
		}
		
		// Create the users paragraph
		var pUsers = document.createElement('p');
		pUsers.appendChild(document.createTextNode('Users: '));
		for(var i = 0; i < artist.userIds.length; i++) {
			var user = users.get(artist.userIds[i]);
			
			var span = document.createElement('span');
			$(span).text(user['name']);
			pUsers.appendChild(span);
			
			var sep; (i != artist.userIds.length - 1) ? sep = document.createTextNode(', ') : sep = document.createTextNode('.');
			pUsers.appendChild(sep);
		}
		
		// Create the tracks table
		var table = document.createElement('table');
		var tbody = document.createElement('tbody');
		var headerRow = document.createElement('tr');
		var header1 = document.createElement('td'); $(header1).text('Track'); headerRow.appendChild(header1);
		var header2 = document.createElement('td'); $(header2).text('Users'); headerRow.appendChild(header2);
		var header3 = document.createElement('td'); $(header3).text('Length'); headerRow.appendChild(header3);
		tbody.appendChild(headerRow);
		
		// Fill the tracks table
		for(var i = 0; i < artist.tracks.length; i++) {
			var trackTr = document.createElement('tr');
			
			// Name
			var tdName = document.createElement('td'); $(tdName).text(artist.tracks[i].name);
			trackTr.appendChild(tdName);
			
			// Users
			var tdUsers = document.createElement('td');
			for(var j = 0; j < artist.tracks[i].userIds.length; j++) {
				var user = users.get(artist.tracks[i].userIds[j]);
				var parts = user.name.split(' ');
				var initials = '';
				for(var k = 0; k < parts.length; k++)
					initials += parts[k][0].toUpperCase();
				var span = document.createElement('span'); $(span).text(initials);
				tdUsers.appendChild(span);
			}
			trackTr.appendChild(tdUsers);
			
			// Length
			var mins = Math.floor(artist.tracks[i].length / (1000 * 60));
			var secs = Math.floor((artist.tracks[i].length - mins * 1000 * 60) / 1000);
			var tdLen = document.createElement('td'); $(tdLen).text(mins + ':' + (secs + 1e15 + '').slice(-2));
			trackTr.appendChild(tdLen);
			
			tbody.appendChild(trackTr);
		}
		
		// Append everything
		if(img != null) col.appendChild(img);
		col.appendChild(name);
		col.appendChild(pUsers);
		table.appendChild(tbody); col.appendChild(table);
		row.appendChild(col);
		$('#a-' + artistId).after(row);
	});
}

/**
 * Display the array of artists
 * @param {object} array - The array of artists to display
 * @param {number} offset - The index of the array to start
 * @param {numer} limit - The index of the array to stop
 */
function displayArtists(array, offset, limit) {
	
	// Remove the old table
	if(offset === null || offset === 0) {
		var len = $('#artists tbody').children().length
		for(var i = 0; i < len - 1; i++) {
			$('#artists tbody tr').last().remove();
		}
	}

	// Show subset of results
	var start; (offset === null) ? start = 0 : start = offset;
	var end; (limit === null) ? end = array.length : end = Math.min(array.length, limit);
	
	// Add the artists back
	for(var i = start; i < end; i++) {
		var artist = array[i];
		
		// Add the artist to the displayed list of artists
		var row = document.createElement('tr');
		row.setAttribute('id', 'a-' + artist.artistId);
		row.setAttribute('onclick', 'displayArtistInfo("' + artist.artistId + '")');
		
		// Add the artist's name
		var colName = document.createElement('td');
		colName.appendChild(document.createTextNode(artist.name));
		row.appendChild(colName);

		// Add the artist's tracks
		var colTracks = document.createElement('td');
		colTracks.appendChild(document.createTextNode(artist.tracks.length));
		row.appendChild(colTracks);
		
		// Add the artist's name
		var colUsers = document.createElement('td');
		colUsers.appendChild(document.createTextNode(artist.getUserCount()));
		row.appendChild(colUsers);

		$('#artists').append(row);
	}
};

/**
 * Toggle the display of a user's playlists
 * @param {string} userId - The ID of the User whose playlists to display
 */
function displayPlaylists(userId) {
	var cell = $('#u-' + userId + ' td')[0];

	// Add the list if it's not there yet
	if(cell.childNodes.length === 1) {
		
		// Create unordered list
		var list = document.createElement('ul');
		list.setAttribute('class', 'playlists');
		
		// Add playlists to unordered list
		var playlists = users.get(userId).playlists.sort(sorting.name).reverse();
		for(var i = 0; i < playlists.length; i++) {
			
			// Create the list item
			var listItem = document.createElement('li');
			listItem.setAttribute('id', userId + '-' + playlists[i].id);
			(playlists[i].active === true) ? listItem.style.color = 'rgb(180, 180, 180)' : listItem.style.color = 'rgb(100, 100, 100)';
			
			// Create the text
			var textSpan = document.createElement('span');
			textSpan.innerText = playlists[i].name;
			textSpan.setAttribute('onclick', 'toggleActive("' + userId + '","' + playlists[i].id + '")');
			
			// Append everything
			listItem.appendChild(textSpan);
			list.appendChild(listItem);
		}
		
		cell.appendChild(list);
	}
	
	// Remove the list if it is
	else {
		cell.removeChild(cell.lastChild);
	}
}

/**
 * Get the current user's id and call getPublicPlaylistIds()
 */
function getCurrentUser(progress) {
	spotifyGet('https://api.spotify.com/v1/me', function(data) {
		var userData = JSON.parse(data['responseText']);
		users.add(userData['id'], progress);
	});
};

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
};

/**
 * Recompute the matches for each user
 */
function recompute() {
	
	// Erase everything
	matches = new Matches();
	progress.queue = 0;
	progress.completed = 0;
	
	// Re-crunch all users' playlists
	for(var i = 0; i < users.users.length; i++) {
		for(var j = 0; j < users.users[i].playlists.length; j++) {
			progress.add();
			crunchPlaylist(users.users[i].id, users.users[i].playlists[j].id, progress);
		}
	}
}

/**
 * Show more artists in the artists table
 */
function showMore() {
	var start = $('#artists tbody').children().length - 1;
	var end = start + limitDelta;
	
	displayArtists(matches['artists'], start, end);
};

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
				console.log("Authorization error. Redirecting to login page.");
				window.location.replace('/');
			}
			
			// Log other errors
			else {
				error(data);
			}
		}
	});
};

/**
 * Toggle whether a user's playlist is active or not and recompute matches
 * @param {string} userId - The ID of the User to toggle
 * @param {string} playlistId - The ID of the Playlist to toggle
 */
function toggleActive(userId, playlistId) {
	var playlist = users.get(userId).getPlaylist(playlistId);
	var element = $('#' + userId + '-' + playlistId)[0];
	
	if(playlist.active === true) {
		playlist.active = false;
		element.style.color = 'rgb(100, 100, 100)';
	} 
	else {
		playlist.active = true;
		element.style.color = 'rgb(180, 180, 180)';
	}
	
	// Recompute
	recompute();
}



/**
 * CLASSES
 */



/**
 * Basic constructor for a new artist
 * @param {string} artistId - the artist's id
 */
function Artist(artistId) {
	this.artistId = artistId;
	this.name;
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
		if(this.tracks[i].id === trackId) {
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
Artist.prototype.getTrack = function(trackId) {
	for(var i = 0; i < this.tracks.length; i++)
		if(this.tracks[i].id === trackId)
			return this.tracks[i];
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
 * @param {string} sortBy - The type of sort to perform (options: 'users', 'name', 'length')
 * @param {string} order - Order in which to sort (options: 'asc', 'desc')
 */
Artist.prototype.sort = function(sortBy, order, ties) {
	var sorted = this.tracks;
	var sortFunction = sorting[sortBy];
	
	sorted = sorted.sort(function(a, b) {
		return sortFunction(a, b, order, ties);
	});
	
	return sorted;
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
 * @param {string} sortBy - The type of sort to perform (options: 'users', 'name')
 * @param {string} order - Order in which to sort (options: 'asc', 'desc')
 * @param {string} [trackSortBy] - The type of sort to perform (options: 'users', 'name')
 * @param {string} [trackOrder] - Order in which to sort (options: 'asc', 'desc')
 */
Matches.prototype.sort = function(sortBy, order, ties, trackSortBy, trackOrder, trackTies) {
	var sorted = this.artists;
	var sortFunction = sorting[sortBy];
	
	// Sort using the sort function
	sorted = sorted.sort(function(a, b) {
		return sortFunction(a, b, order, ties);
	});
	
	// Sort artists' tracks
	if(trackSortBy != null && trackOrder != null) {
		for(var i = 0; i < sorted.length; i++) {
			sorted[i].sort(trackSortBy, trackOrder, trackTies);
		}
	}
	
	// Update the UI
	limitCurrent = limitDelta;
	displayArtists(matches.artists, 0, limitCurrent);
	
	return sorted;
};



/**
 * A playlist
 * @param {string} playlistId - The ID of the playlist
 * @param {string} plaistName - The name of the playlist
 */
function Playlist(playlistId, playlistName) {
	this.id = playlistId;
	this.name = playlistName;
	this.active = true;
}



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
 * Basic constructor for a new Track
 * @param {string} trackId - The track's id
 */
function Track(trackId) {
	this.id = trackId;
	this.length;
	this.name;
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
 * Basic constructor for a User
 * @param {string} userId - The id of the user to add
 * @param {string} userName - The name of the user to add
 */
function User(userId, userName) {
	this.id = userId;
	this.name = userName;
	this.playlists = [];
};

/**
 * Add a playlist
 * @param {string} playlistId - The ID of the playlist to add
 * @param {string} playlistName - The name of the playlist to add
 */
User.prototype.addPlaylist = function(playlistId, playlistName) {
	this.playlists.push(new Playlist(playlistId, playlistName));
}

/**
 * Get a playlist
 * @param {string} playlistId - The ID of the platlist to get
 */
User.prototype.getPlaylist = function(playlistId) {
	for(var i = 0; i < this.playlists.length; i++) {
		if(this.playlists[i].id === playlistId) {
			return this.playlists[i];
		}
	}
	return null;
}



/**
 * Basic constructor for a Users object
 */
function Users() {
	this.users = [];
}

/**
 * Add a new User to a Users object
 * @param {string} userId - The id of the User to add
 * @param {Progress} progress - The progress function to use while adding the user's playlists
 */
Users.prototype.add = function(userId, progress) {
	var array = this.users;
	
	// If a URL or URI is passed, grab the id from that
	if(userId.indexOf('user') != -1) {
		userId = userId.substring(userId.indexOf('user') + 5);
	}
		
	// Check if the user already exists
	for(var i = 0; i < array.length; i++) {
		if(array[i].id === userId) {
			return;
		}
	}
	
	// Add the user
	spotifyGet('https://api.spotify.com/v1/users/' + userId, function(data) {
		
		// Get the user's data
		var userData = JSON.parse(data['responseText']);
		var name; (userData['display_name'] != null) ? name = userData['display_name'] : name = userId;
		var user = new User(userId, name);
		
		// Add the user to the users array
		array.push(user);
		
		// Create the user's row
		var userRow = document.createElement('tr');
		userRow.setAttribute('id', 'u-' + user.id);
		
		// Create the user's name's column
		var userCol1 = document.createElement('td');
		
		// Create the span for the user's name
		var userNameElement = document.createElement('span');
		userNameElement.setAttribute('onclick', 'displayPlaylists("' + user.id + '")');
		
		// Append everything
		userNameElement.appendChild(document.createTextNode(user.name));
		userCol1.appendChild(userNameElement);
		userRow.appendChild(userCol1);
		$('#users').append(userRow);
	});
	
	// Add the user's playlists
	getPublicPlaylistIds(userId, progress);
};

/**
 * Get a User by their ID
 * @param {string} userId - The ID of the user to get
 * @returns The user
 */
Users.prototype.get = function(userId) {
	var index = -1;
	
	for(var i = 0; i < this.users.length; i++) {
		if(this.users[i].id === userId) {
			index = i;
		}
	}
	
	if(index != -1) {
		return this.users[index];
	}
	return null;
};