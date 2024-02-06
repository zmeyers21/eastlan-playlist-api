import * as scraper1 from "./scrapers/scraper1.mjs";
import * as scraper2 from "./scrapers/scraper2.mjs";
import * as db from "./services/db.mjs";
import * as playlistProcessor from './services/playlist.processor.mjs';
import * as mapper from './services/mapper.mjs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

const url_electric949 = 'https://www.electric949.com/station/iframe_last10played.shtml';
const url_wsks = 'http://wsks.tunegenie.com/onair/';

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
    artists.sort(mapper.compareByName);
    res.json(artists);
  });
});

app.get('/artists/:artistId', (req, res) => {
  db.getOne('artists', req.params.artistId).then(artist => {
    res.json(artist);
  });
});

async function scrapeAndStash() {

  // Electric 94.9
  let playlist1 = await scraper1.scrape(url_electric949);
  playlist1.reverse();
  await playlistProcessor.process(playlist1, '65b4b7c438fc9b72914b5b68');

  // KISS FM
  let playlist2 = await scraper2.scrape(url_wsks);
  playlist2.reverse();
  await playlistProcessor.process(playlist2, '65bea3c1e5898920cd13991a');

}

scrapeAndStash();

setInterval(() => {
  scrapeAndStash();
}, 180000);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
