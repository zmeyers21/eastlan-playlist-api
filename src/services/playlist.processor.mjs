import * as mapper from './mapper.mjs';
import * as db from "./db.mjs";

export async function process(playlist, stationId) {

  // Validate the artists and insert any new ones that arent saved yet
  await db.validateArtists(playlist);

  // Map the songs > artists
  const mappedPlaylist = await mapper.mapSongsToArtists(playlist, stationId);
  const recentSongsFromDB = await db.getLatestSongsByStation(stationId, playlist.length);
  const songsToInsert = mappedPlaylist.filter(a => !recentSongsFromDB.find(b => a.artistId.toString() == b.artistId.toString() && a.song == b.song));
  
  if (songsToInsert?.length) {
    console.log(`adding ${songsToInsert.length} songs [${stationId}]: `, songsToInsert);
    await db.addMany('songs', songsToInsert);
    console.log('songs added!');
  } else {
    console.log('no new songs');
  }
}