import jinja2
import logging
import os
import webapp2
import json


# Get keys
f = open('assets/keys.json')
keys = json.loads(f.read())
f.close()

SPOTIFY_CLIENT_ID = keys['SPOTIFY_CLIENT_ID']
SPOTIFY_API_SECRET = keys['SPOTIFY_API_SECRET']

# Main page
class MainPage(webapp2.RequestHandler):

	def get(self):
		template_values = {}
		template = jinja_environment.get_template('index.html')
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
	], 
	debug=True
)