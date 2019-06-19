const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const obj = {
    table: []
};
for (let i = 0; i < 8; i++) {
fetch(`https://jobs.tut.by/catalog/Informacionnye-tehnologii-Internet-Telekom/Nachalnyj-uroven/page-${i}`)
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
                        const name = $('h1.header').text(),
                              salary = $('p.vacancy-salary').text(),
                              experience = $('span[data-qa = "vacancy-experience"]').text(),
                              company = $('span[itemprop = "name"]').text(),
                              employment = $('p[data-qa = "vacancy-view-employment-mode"]').text(),
                              date = $('p.vacancy-creation-time').text(); 
                        obj.table.push({Name: name, Salary: salary});
                        const json = JSON.stringify(obj);                               
                        fs.writeFileSync('result.json', json);
                        console.log(name, '|', company, '|', employment, '| Опыт:', experience, '| З/п:', salary, '|', date);
                    }
                )
        })
    });
}