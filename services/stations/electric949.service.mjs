import * as mongo from "mongodb";
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as dbService from '../../services/db.mjs';

const url = 'https://www.electric949.com/station/iframe_last10played.shtml';
const key = 'electric949';
const recentSongs = [];
export const stationId = new mongo.ObjectId('65b4b7c438fc9b72914b5b68');

export async function crawl() {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html, null, false);
  var htmlItems = [];
  $('img').remove();
  $('div[id="rp-container"]').find('div > div').each(function(i, element) {
    htmlItems.push($(element).html());
  });

  const filteredHtmlItems = htmlItems.filter(x => x.includes('<span'));
  let songs = [];
  let orderNum = filteredHtmlItems.length;

  filteredHtmlItems.forEach(item => {
    var artist = '';
    var song = '';

    song = item.substring(0, item.indexOf('<br>'));
    artist = item.substring(item.indexOf('<span style="font-weight:800;">') + 31, item.indexOf('</span>'));
    songs.push({
      stationId: stationId,
      artist: artist,
      song: song,
      dateTimeEntered: new Date(),
      _order: orderNum
    });
    orderNum--;
  });
  return songs;
}
