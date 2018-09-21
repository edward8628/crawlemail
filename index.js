
const Crawler = require("simplecrawler");
const cheerio = require('cheerio');
const url = 'http://bbs.uclacssa.org/forum.php?mod=forumdisplay&fid=37'
let emails = []

let crawler = new Crawler(url);

// crawler.host = url
crawler.interval = 10; // Ten seconds
crawler.maxConcurrency = 3;

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
    // console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
    // console.log("It was a resource of type %s", response.headers['content-type']);
    let $ = cheerio.load(responseBuffer.toString("utf8"));
    let html = $.html();
    let list = getEmails(html)
    if (list) {
        list.forEach((item) => {
            if(!emails.includes(item)) {
                console.log(item)
                emails.push(item)
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
    console.log("Finished!", emails.length);
});

crawler.start();

//todo, trim emails, improve getEmails function
//todo, push to database with email, date, domain

function getEmails(string) {
    const emails = string.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    return emails;
}
