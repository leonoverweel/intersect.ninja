/**
 * Test the Artist() function
 */
QUnit.test("Test the Artist() function", function (assert) {
	
	var artist = new Artist('04gDigrS5kc9YWfZHwBETP');
	artist.addUser('1262384713');
	
	assert.strictEqual(
		artist.artistId, 
		'04gDigrS5kc9YWfZHwBETP', 
		"artist's artistId is correctly set"
	);
	
  	assert.strictEqual(
		  artist.userIds[0], 
		  '1262384713', 
		  "artist's initial userId is correctly set"
	);
	
	assert.strictEqual(
		artist.getUserCount(), 
		1, 
		"artist's initial getUserCount() is correct"
	);
	
	artist.addUser('1262384713');
	assert.strictEqual(
		artist.getUserCount(), 
		1, 
		"artist's getUserCount() is correct after trying to add an existing user"
	);
	
	artist.addUser('2623847132');
	assert.strictEqual(
		artist.getUserCount(), 
		2, 
		"artist's getUserCount() is correct after adding a new user"
	);
	
	artist.addTrack('3KWavdcNkuCYvgJaRABYAD', '1262384713');
	assert.strictEqual(
		artist.tracks[0]['trackId'],
		'3KWavdcNkuCYvgJaRABYAD',
		"Successfully added a track"
	);
	
	assert.strictEqual(
		artist.getTrack('3KWavdcNkuCYvgJaRABYAD').getUserCount(),
		1,
		"Initial track count correct"
	);
	
	artist.addTrack('3KWavdcNkuCYvgJaRABYAD', '1262384713');
	assert.strictEqual(
		artist.getTrack('3KWavdcNkuCYvgJaRABYAD').getUserCount(),
		1,
		"Count track correct after adding track again by same user"
	);
	
	artist.addTrack('3KWavdcNkuCYvgJaRABYAD', '2623847131');
	assert.strictEqual(
		artist.getTrack('3KWavdcNkuCYvgJaRABYAD').getUserCount(),
		2,
		"Count track correct after adding track again by different user"
	);
	
});

/**
 * Test the Track() function
 */
QUnit.test("Test the Track() function", function (assert) {
	
	var track = new Track('3KWavdcNkuCYvgJaRABYAD');
	track.addUser('1262384713');
	
	assert.strictEqual(
		track.trackId, 
		'3KWavdcNkuCYvgJaRABYAD', 
		"track's trackId is correctly set"
	);
	
	assert.strictEqual(
		track.userIds[0], 
		'1262384713', 
		"track's initial userId is correctly set"
	);
	
	assert.strictEqual(
		track.getUserCount(), 
		1, 
		"track's initial getUserCount() is correct"
	);
	
	track.addUser('1262384713');
	assert.strictEqual(
		track.getUserCount(), 
		1, 
		"track's getUserCount() is correct after trying to add an existing user"
	);
	
	track.addUser('2623847132');
	assert.strictEqual(
		track.getUserCount(), 
		2, 
		"track's getUserCount() is correct after adding a new user"
	);
});

/**
 * Test the Matches() function
 */
QUnit.test("Test the Matches() function", function (assert) {
	
	var matches = new Matches();
	matches.add('04gDigrS5kc9YWfZHwBETP', '3KWavdcNkuCYvgJaRABYAD', '2623847132');
	
	assert.strictEqual(
		matches.artists[0].artistId,
		'04gDigrS5kc9YWfZHwBETP', 
		"First artist's id is correctly set"
	);
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getUserCount(),
		1,
		"First artist has correct number of initial users"
	);
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getTrack('3KWavdcNkuCYvgJaRABYAD').getUserCount(),
		1,
		"First artist's first track has correct number of initial users"
	);
	
	// Add the artist and track again, by the same user
	matches.add('04gDigrS5kc9YWfZHwBETP', '3KWavdcNkuCYvgJaRABYAD', '2623847132');
	
	assert.strictEqual(
		matches.artists.length,
		1,
		"matches has correct number of artists after adding same artist again"
	);
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getUserCount(),
		1,
		"First artist has correct number of users after adding them again by the same user"
	);
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getTrack('3KWavdcNkuCYvgJaRABYAD').getUserCount(),
		1,
		"First artist's first track has correct number of users after adding it again by the same user"
	);
	
	// Add the same track by the same artist, by a different user
	matches.add('04gDigrS5kc9YWfZHwBETP', '3KWavdcNkuCYvgJaRABYAD', '6238471322');
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getUserCount(),
		2,
		"First artist has correct number of users after adding it again by a second user"
	);
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getTrack('3KWavdcNkuCYvgJaRABYAD').getUserCount(),
		2,
		"First artist's first track has correct number of users after adding it again by a second user"
	);
	
	// Add a different track by the same artist, by user 2
	matches.add('04gDigrS5kc9YWfZHwBETP', 'KWavdcNkuCYvgJaRABYAD3', '6238471322');
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getUserCount(),
		2,
		"First artist still has correct number of users after adding a new track by a second user"
	);
	
	assert.strictEqual(
		matches.getArtist('04gDigrS5kc9YWfZHwBETP').getTrack('KWavdcNkuCYvgJaRABYAD3').getUserCount(),
		1,
		"First artist's second track has correct number of users after adding it user 2"
	);
	
	// Add a different artist
	matches.add('4gDigrS5kc9YWfZHwBETP0', 'KWavdcNkuCYvgJaRABYAD3', '6238471322');
	
	assert.strictEqual(
		matches.artists.length,
		2,
		"matches has correct number of artists after adding a second artist"
	);
	
});