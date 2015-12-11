$(document).ready(function() {
	$('#access_token').html(localStorage.getItem("access_token"));
	$('#refresh_token').html(localStorage.getItem("refresh_token"));
});