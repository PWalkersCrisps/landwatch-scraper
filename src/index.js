const cheerio = require('cheerio');
const request = require('request');

const fs = require('fs');
const csv = require('fast-csv');

function scrapePages(startingPage, maxPages) {

    if (startingPage === 1) {
        getListings('https://www.landwatch.com/land');
    }

    if (maxPages < 2) return;

    for (let i = startingPage; i <= maxPages; i++) {
        getListings(`https://www.landwatch.com/land/page-${i}`)
    }
}

function getListings(url) {
    request(url, (error, response, html) => {
        const $ = cheerio.load(html);
        const data = [];
        $('._154c4').each((index, element) => {
            const titleArray = $(element).find('a').first().text().split(' • ');
            const acreSize = titleArray[0];
            const price = titleArray[1];
            const url = `https://www.landwatch.com${$(element).find('a').first().attr('href')}`;
            const description = $(element).find('._2e9a2').text();
            data.push({ price, acreSize, url, description });
        });
        
        if (!fs.existsSync('./output')) {
            fs.mkdirSync('./output');
        }

        switch(process.argv[5]){
            case 'json':
                exportToJSON(data);
                break;
            case 'csv':
                exportToCSV(data);
                break;
            case 'text':
                exportToText(data);
                break;
            default:
                exportToJSON(data);
                break;
        }
    });
}

function exportToJSON(data){
    const exportFile = (typeOfWrite === 'a') ? './output/listings.json' : `./output/listings${new Date().toISOString().slice(0, 10)}.json`;
    const typeOfWrite = process.argv[2] === 'a' ? 'a' : 'w';
    const writeStream = fs.createWriteStream( exportFile, { flags: typeOfWrite });
    if (fs.existsSync('listings.json')) {
        writeStream.write(JSON.stringify(data));
    }
    else {
        writeStream.write(JSON.stringify(data, null, 2));
    }
}

function exportToCSV(data){
    const exportFile = (typeOfWrite === 'a') ? './output/listings.csv' : `./output/listings${new Date().toISOString().slice(0, 10)}.csv`;
    const typeOfWrite = process.argv[2] === 'a' ? 'a' : 'w';
    const writeStream = fs.createWriteStream( exportFile, { flags: typeOfWrite });
    if (fs.existsSync('listings.csv')) {
        csv.write(data, {}).pipe(writeStream);
    } 
    else {
        csv.write(data, { headers: true }).pipe(writeStream);
    }
}

function exportToText(data){
    const exportFile = (typeOfWrite === 'a') ? './output/listings.txt' : `./output/listings${new Date().toISOString().slice(0, 10)}.txt`;
    const typeOfWrite = process.argv[2] === 'a' ? 'a' : 'w';
    const writeStream = fs.createWrite( exportFile, { flags: typeOfWrite });
    if (fs.existsSync('listings.txt')) {
        writeStream.write(data);
    }
    else {
        writeStream.write(data, null, 2);
    }
}

const startingPage = process.argv[3] || 1;
const maxPages = process.argv[4] || 1;
scrapePages(startingPage, maxPages);