import * as scraper1 from "./scrapers/scraper1.mjs";
import * as db from "./services/db.mjs";
import * as mapper from './services/mapper.mjs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

const url_electric949 = 'https://www.electric949.com/station/iframe_last10played.shtml';
const stationId_electric949 = '65b4b7c438fc9b72914b5b68';

// API endpoints
app.get('/stations', (req, res) => {
  db.getAll('stations').then(stations => {
    res.json(stations);
  });
});

app.get('/playlist/:stationId/:count', (req, res) => {
  db.getLatestSongsByStation(req.params.stationId, parseFloat(req.params.count)).then(songs => {
    res.json(songs);
  });
});

app.get('/artists', (req, res) => {
  db.getAll('artists').then(artists => {
    res.json(artists);
  });
});

app.get('/artists/:artistId', (req, res) => {
  db.getOne('artists', req.params.artistId).then(artist => {
    res.json(artist);
  });
});

async function scrape() {

  // Load playlist from web
  let electric949Playlist = await scraper1.scrape(url_electric949);
  electric949Playlist.reverse();

  // Validate the artists and insert any new ones that arent saved yet
  await db.validateArtists(electric949Playlist);

  // Map the songs > artists
  const playlist = await mapper.mapSongsToArtists(electric949Playlist);
  const recentSongsFromDB = await db.getLatestSongsByStation(stationId_electric949, playlist.length);
  const songsToInsert = playlist.filter(a => !recentSongsFromDB.find(b => a.artistId.toString() == b.artistId.toString() && a.song == b.song));
  
  if (songsToInsert?.length) {
    console.log(`adding ${songsToInsert.length} songs: `, songsToInsert);
    await db.addMany('songs', songsToInsert);
    console.log('songs added!');
  } else {
    console.log('no new songs');
  }
}

scrape();

setInterval(() => {
  scrape();
}, 180000);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
