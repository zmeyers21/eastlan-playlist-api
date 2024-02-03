import * as db from './db.mjs';
import * as mongo from "mongodb";

const stationId = '65b4b7c438fc9b72914b5b68';

export async function mapSongsToArtists(playlist) {
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