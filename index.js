const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const obj = {
    table: []
};

fetch(`https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&no_magic=false&order_by=relevance&search_period=30&page=0`)
    .then (
        function(response) {
            return response.text();
        }
    )
    .then (function(body) {
        const $ = cheerio.load(body);
        $('div.resume-search-item__header').each((i, el) => {
            const link = $(el).find('a').attr('href');
            fetch(`https://jobs.tut.by${link}`)
                .then (
                    function(response) {
                        return response.text();
                    }
                )
                .then (
                    function(body) {
                        const $ = cheerio.load(body);
                        const name = $('span[data-qa="resume-block-title-position"]').text(),
                              gender = $('span[itemprop = "gender"]').text(),
                              age = $('span[data-qa = "resume-personal-age"]').text(),
                              about = $('div[data-qa="resume-block-skills-content"]').text(),
                              education = $('div[itemprop = "alumniOf"]').text();
                              salary = $('span[data-qa="resume-block-salary"]').text();
                        obj.table.push({Name: name, Gender: gender, Age: age, Education: education, Salary: salary, About: about});
                        const json = JSON.stringify(obj);
                        fs.writeFileSync('result.json', json);
                    }
                )
        })
    });