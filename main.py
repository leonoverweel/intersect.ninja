import jinja2
import logging
import os
import webapp2
import json

# Grab keys
f = open('assets/keys.json')
keys = json.loads(f.read())
f.close()

# Constants
SPOTIFY_CLIENT_ID = keys['client_id']
SPOTIFY_CLIENT_SECRET = keys['client_secret']
BASE_URL = keys['base_url']

# Main page
class MainPage(webapp2.RequestHandler):

	def get(self):
		template_values = {}
		template = jinja_environment.get_template('index.html')
		self.response.out.write(template.render(template_values))

# Match page
class MatchPage(webapp2.RequestHandler):

	def get(self):
		template_values = {}
		template = jinja_environment.get_template('match.html')
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
		('/', MainPage),
		('/match', MatchPage)
	], 
	debug=True
)