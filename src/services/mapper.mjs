import * as db from './db.mjs';
import * as mongo from "mongodb";

export async function mapSongsToArtists(playlist, stationId) {
  const mappedPlaylist = await db.getAll('artists').then(artists => {
    playlist.forEach(song => {
      const artistId = new mongo.ObjectId(artists.find(x => x.name == song.artist)?._id)
      song.stationId = new mongo.ObjectId(stationId)
      song.artistId = new mongo.ObjectId(artistId);
      delete song['artist'];
    });
    return playlist;
  });
  return mappedPlaylist;
}

export function compareByName( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}