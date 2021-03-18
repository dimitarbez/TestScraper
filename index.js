const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs');

const url = 'https://webscraper.io/test-sites/e-commerce/allinone'

async function getHDDListings(page) {
    let hddList = []
    let html = await page.content()
    let $ = cheerio.load(html)
      
    for (let i = 1; i <= $('.swatch').length; i++) {
        await page.click(`.swatches > button:nth-of-type(${i})`)
        html = await page.content()
        $ = cheerio.load(html)
        let storage = $(`.swatches > button:nth-of-type(${i})`).text()
        let isAvailable = $(`.swatches > button:nth-of-type(${i})`).attr('class').includes('disabled') ? true : false
        hddList.push({
            'storage': storage,
            'price': $('.price').text(),
            'available': isAvailable
        })
    }

    return hddList
}

async function getDataFromItem(page, itemUrl) {
    let item = {}
    await page.goto(itemUrl)
    const html = await page.content()
    const $ = cheerio.load(html)
    
    item['name'] = $('.caption > h4:nth-of-type(2)').text()
    item['description'] = $('.description').text()
    item['image_URL'] = 'https://webscraper.io' + $('.img-responsive').attr('src')
    item['reviews'] = parseInt($('.ratings > p').text().trim().split(' ')[0])
    item['HDD'] = await getHDDListings(page)

    return item
}

async function listAllItemUrls(page) {
    await page.goto(url)
    const html = await page.content()
    const $ = cheerio.load(html)
    const results = $('.title').map((index, item) => { return 'https://webscraper.io' + $(item).attr('href') }).get()
    return results
}

async function main () {
    const browser = await puppeteer.launch({headless: false, slowMo: 200})
    const page = await browser.newPage()
    page.setViewport({width: 1920, height: 1080})

    let data = []

    const listingsUrls = await listAllItemUrls(page)
    for (let i = 0; i < listingsUrls.length; i++) {
        const item = await getDataFromItem(page, listingsUrls[i])
        data.push(item)
    }

    console.log(data)
    browser.close()
    fs.writeFileSync('data.json', JSON.stringify(data))
}

main()