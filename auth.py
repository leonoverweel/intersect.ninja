import jinja2
import logging
import os
import webapp2
import json
import urllib
import base64
import json
from google.appengine.api import urlfetch

# Grab keys
f = open('assets/keys.json')
keys = json.loads(f.read())
f.close()

# Constants
SPOTIFY_CLIENT_ID = keys['client_id']
SPOTIFY_CLIENT_SECRET = keys['client_secret']
BASE_URL = keys['base_url']

# Initialize Spotify authorization flow
class Init(webapp2.RequestHandler):

	def get(self):
		"""
		Initiate the authorization process with Spotify.
		"""
		
		url = 'https://accounts.spotify.com/authorize?'
		payload = urllib.urlencode({
			'client_id': SPOTIFY_CLIENT_ID,
			'response_type': 'code',
			'redirect_uri': BASE_URL + 'auth/callback',
			'scope': ' '.join(
				[
					'playlist-modify-public',
					'user-follow-read'
				]
			)
		})
		
		self.redirect(url + payload)

# Authorization callback
class Callback(webapp2.RequestHandler):

	def get(self):
		"""
		Use the authorization code to request the access token from Spotify.
		"""
		
		# Redirect to home page if there's an authorization error 
		if self.request.get('error') != '':
			self.redirect(BASE_URL)

		# Request the access token from Spotify
		url = 'https://accounts.spotify.com/api/token'
		payload = urllib.urlencode({
			'code': self.request.get('code'),
			'client_id': SPOTIFY_CLIENT_ID,
			'client_secret': SPOTIFY_CLIENT_SECRET,
			'grant_type': 'authorization_code',
			'redirect_uri': BASE_URL + 'auth/callback'
		})
		response = urlfetch.fetch(
			url = url,
			payload = payload,
			method = urlfetch.POST,
		)
		
		# Redirect to the home page if there's an error getting the access token
		if response.status_code != 200:
			self.redirect(BASE_URL)
		data = json.loads(response.content)
		
		# Respond
		template_values = {
			'access_token': data['access_token'],
			'redirect': BASE_URL + 'match',
			'refresh_token': data['refresh_token']
		}
		template = jinja_environment.get_template('html/auth.html')
		self.response.out.write(template.render(template_values))

# Jinja setup
jinja_environment = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
	extensions=['jinja2.ext.autoescape'],
	autoescape=True
)

# Application setup
application = webapp2.WSGIApplication(
	[
		('/auth/init', Init),
		('/auth/callback', Callback),
	], 
	debug=True
)