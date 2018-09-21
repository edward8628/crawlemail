require('dotenv').config();
const Crawler = require("simplecrawler");
const cheerio = require('cheerio');
const moment = require('moment');
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB,
    },
})

const url = 'http://www.osubbs.com/forum.php?mod=forumdisplay&fid=37'
const project = 'dmooji'
let crawler = new Crawler(url);

// crawler.host = url
crawler.interval = 10; // Ten seconds
crawler.maxConcurrency = 3;

crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
    // console.log("I just received %s (%d by, tes)", queueItem.url, responseBuffer.length);
    // console.log("It was a resource of type %s", response.headers['content-type']);
    let $ = cheerio.load(responseBuffer.toString("utf8"));
    let html = $.html();
    let emails = getEmails(html)

    if (emails) {
        emails.forEach(async (email) => {
            console.log(email, queueItem.host)
            const domain = queueItem.host
            const source = queueItem.url
            const start_url = url
            const createdAt = moment(new Date().toUTCString()).format('YYYY-MM-DD HH:mm:ss');

            try {
                await knex(project).insert({
                  email, start_url, domain, source, createdAt
                })
            } catch (error) {
                console.log(error.code)
            }

        })
    }
});

// crawler.on("crawlstart", function() {
//     console.log("Crawl starting");
// });

// crawler.on("fetchstart", function(queueItem) {
//     console.log("fetchStart", queueItem);
// });

crawler.on("complete", function() {
    console.log("Finished!");
});

crawler.start();

function getEmails(string) {
    return string.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}
