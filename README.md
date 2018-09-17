# Intersect.Ninja for Spotify
Use multiple peoples' public Spotify playlists to find intersections in the artists and tracks they like.

http://intersect.ninja/

Note: I built this site back in high school (and it was my first large front-end project), so even though it still runs fine, the code and architecture are not up to the standards of what I write today 😅.

## Repo Setup

To get started, make a new Google App Engine application, note down its ID, and make sure you've got the App Engine Launcher installed for deployment and local testing.

Then, go to Spotify's developer console, register your app, and add `http://your-app-id.appspot.com/` to the whitelist of redirect URLs.

Once you fork/ clone this repository, make a folder called `assets` in the root directory, and add a file `keys.json` with the following content:

```json
{
	"client_id": "SPOTIFY_CLIENT_ID",
	"client_secret": "SPOTIFY_CLIENT_SECRET",
	"base_url": "http://your-app-id.appspot.com/"
}
```

Also, modify the first line in `app.yaml` to be:

```yaml
application: your-app-id
```