const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs');
const { parse } = require('path');

const url = 'https://webscraper.io/test-sites/e-commerce/allinone'

// get the hdd data for the specific item
async function getHDDListings(page) {
    let hddList = []
    let html = await page.content()
    let $ = cheerio.load(html)
      
    for (let i = 1; i <= $('.swatch').length; i++) {
        let swatchElement = `.swatches > button:nth-of-type(${i})`
        await page.click(swatchElement)
        html = await page.content()
        $ = cheerio.load(html)
        let storage = $(swatchElement).text()
        let isAvailable = $(swatchElement).attr('class').includes('disabled') ? false : true
        hddList.push({
            'storage': parseInt(storage),
            'price': $('.price').text(),
            'available': isAvailable
        })
    }

    return hddList
}

// get data from specific item
async function getDataFromItem(page, itemUrl) {
    let item = {}
    await page.goto(itemUrl)
    const html = await page.content()
    const $ = cheerio.load(html)
    
    item['name'] = $('.caption > h4:nth-of-type(2)').text()
    item['description'] = $('.description').text()
    item['image_URL'] = 'https://webscraper.io' + $('.img-responsive').attr('src')
    item['rating'] = parseInt($('.ratings > p > span').length)
    item['reviews'] = parseInt($('.ratings > p').text().trim().split(' ')[0])
    item['HDD'] = await getHDDListings(page)

    return item
}

// go through all items
async function listAllItemUrls(page) {
    await page.goto(url)
    const html = await page.content()
    const $ = cheerio.load(html)
    const results = $('.title').map((index, item) => { return 'https://webscraper.io' + $(item).attr('href') }).get()
    return results
}

async function main () {
    const browser = await puppeteer.launch({headless: true, slowMo: 0})
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