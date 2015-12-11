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
		artist.getTrackCount('3KWavdcNkuCYvgJaRABYAD'),
		1,
		"Initial track count correct"
	);
	
	artist.addTrack('3KWavdcNkuCYvgJaRABYAD', '1262384713');
	assert.strictEqual(
		artist.getTrackCount('3KWavdcNkuCYvgJaRABYAD'),
		1,
		"Count track correct after adding track again by same user"
	);
	
	artist.addTrack('3KWavdcNkuCYvgJaRABYAD', '2623847131');
	assert.strictEqual(
		artist.getTrackCount('3KWavdcNkuCYvgJaRABYAD'),
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
