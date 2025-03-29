const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Spotify credentials from environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Endpoint to get Spotify access token
app.post("/api/spotify/token", async (req, res) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
            "base64"
          ),
      },
      data: "grant_type=client_credentials",
    });

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error("Error getting Spotify token:", error.message);
    res.status(500).json({ error: "Failed to get Spotify access token" });
  }
});

// Endpoint to fetch track information
app.get("/api/spotify/track/:trackId", async (req, res) => {
  try {
    // Get token first
    const tokenResponse = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
            "base64"
          ),
      },
      data: "grant_type=client_credentials",
    });

    const accessToken = tokenResponse.data.access_token;

    // Get track info
    const trackResponse = await axios.get(
      `https://api.spotify.com/v1/tracks/${req.params.trackId}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    res.json(trackResponse.data);
  } catch (error) {
    console.error("Error fetching track:", error.message);
    res.status(500).json({ error: "Failed to fetch track information" });
  }
});

// Endpoint to get lyrics (proxy to lyrics.ovh)
app.get("/api/lyrics/:artist/:title", async (req, res) => {
  try {
    const { artist, title } = req.params;
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artist
      )}/${encodeURIComponent(title)}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching lyrics:", error.message);
    res.status(404).json({ error: "Lyrics not found" });
  }
});

// Serve the main application
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
