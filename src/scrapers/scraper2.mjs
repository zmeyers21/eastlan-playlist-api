import puppeteer from "puppeteer";

export async function scrape(url) {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  await page.goto(url);

  const playlist = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.slot .hidden-on-open .left')).slice(0, 10).map(x => {
      const song = x.querySelector('.song').textContent?.trim();
      const artistContent = x.querySelector('div:nth-child(2)').innerHTML;
      return {
        song: x.querySelector('.song').textContent,
        artist: artistContent.substring(0, artistContent.indexOf('<span'))?.trim()
      }
    });
  });
  await browser.close();
  playlist.forEach(x => x.dateTimeEntered = new Date());
  return playlist;
}