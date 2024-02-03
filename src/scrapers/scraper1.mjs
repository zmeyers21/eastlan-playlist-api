import puppeteer from "puppeteer";

export async function scrape(url) {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  await page.goto(url);

  const playlist = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#rp-meta')).map(x => {
      return {
        song: x.innerHTML.substring(0, x.innerHTML.indexOf('<br>')),
        artist: x.querySelector('span').textContent
      }
    });
  });
  await browser.close();
  playlist.forEach(x => x.dateTimeEntered = new Date());
  return playlist;
}