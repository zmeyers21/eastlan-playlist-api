import * as dbService from '../services/db.mjs';
import * as electric949Service from '../services/stations/electric949.service.mjs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;
let crawlCounter = 0;
app.use(bodyParser.json());
app.use(cors());

// API endpoints
app.get('/stations', (req, res) => {
  dbService.getAll('stations').then(stations => {
    res.json(stations);
  });
});

app.get('/playlist/:stationId/:count', (req, res) => {
  dbService.getLatestSongsByStation(req.params.stationId, parseFloat(req.params.count)).then(songs => {
    res.json(songs);
  });
});

app.get('/artist')

// Imediately crawl the sites to load the initial data
crawlStations();

// Set up future crawls of the sites
setInterval(() => {
  crawlStations();
}, 600000);

async function crawlStations() {
  crawlElectric949();
}

async function crawlElectric949() {
  crawlCounter++;
  try {

    const recentSongsFromStation = await electric949Service.crawl();
    recentSongsFromStation.sort((a, b) => parseFloat(a._order) - parseFloat(b._order));
    
    const recentSongsFromDB = await getRecentSongsFromDB(electric949Service.stationId, recentSongsFromStation.length);

    const songsToInsert = recentSongsFromStation.filter(a => !recentSongsFromDB.find(b => a.artist == b.artist && a.song == b.song));

    if (songsToInsert?.length) {
      songsToInsert.forEach(song => {
        delete song['_order'];
      });
      console.log('adding songs: ', songsToInsert);
      await dbService.addMany('songs', songsToInsert);
      console.log('songs added!');
    }

  } catch (err) {
    console.log(err);
  }
}

async function getRecentSongsFromDB(stationId) {
  return await dbService.getLatestSongsByStation(stationId, 16);
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
