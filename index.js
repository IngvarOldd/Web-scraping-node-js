const fetch = require('node-fetch');
const cheerio = require('cheerio');

fetch('https://jobs.tut.by/catalog/Informacionnye-tehnologii-Internet-Telekom/Nachalnyj-uroven')
    .then (
        function(response) {
            return response.text();
        }
    )
    .then (function(body) {
        const $ = cheerio.load(body);
        $('.resume-search-item__name').each((i, el) => {
            const link = $(el).find('a').attr('href');
            fetch(`${link}`)
                .then (
                    function(response) {
                        return response.text();
                    }
                )
                .then (
                    function(body) {
                        const $ = cheerio.load(body);
                        const name = $('h1.header').text();
                        console.log(name);
                    }
                )
        })
    });