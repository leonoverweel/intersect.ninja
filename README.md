# music-we-like
Use multiple peoples' Spotify accounts to find intersections in the songs, artists and genres they like.

## Setup

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