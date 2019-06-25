const fetch = require('node-fetch');
const DomParser = require('dom-parser');
const parser = new DomParser();
const fs = require('fs');

const obj = {
    table: []
};

fetch(`https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&no_magic=false&order_by=relevance&search_period=30&page=1`)
    .then (
      function(response) {
        return response.text();
      }
    )
    .then (
      function(body) {
        const doc = parser.parseFromString(body);
        const elems = doc.getElementsByClassName('resume-search-item__name');
        const arr = Array.from(elems);  
        arr.forEach(
          (element) => {
            let href = element.getAttribute('href');
            fetch(`https://jobs.tut.by${href}`)
              .then(
                function(response) {
                  return response.text();
                }
              )
              .then(
                function(body) {
                  const doc = parser.parseFromString(body);
                  const names = Array.from(doc.getElementsByClassName('header'));
                  let name = names[0].textContent;
                  const bio = Array.from(doc.getElementsByClassName('resume-header-block'));
                  let gender = bio[0].firstChild.firstChild.textContent;
                  let age;
                  if (typeof(bio[0].firstChild.childNodes[2]) !== 'undefined') {
                    age = bio[0].firstChild.childNodes[2].textContent.replace(/[<!-- -->]/g, '');
                  } else {
                    age = "Возраст не указан";
                  }
                  let skills = Array.from(doc.getElementsByClassName('bloko-tag__section bloko-tag__section_text'));
                  skills = skills.map( (el) => el.textContent );
                  const work = Array.from(doc.getElementsByClassName('resume-block-container'));
                  let employment, schedule;
                  if(typeof(work[0].childNodes[1]) === 'undefined') {
                    employment = work[1].childNodes[1].textContent.replace(/[<!-- -->]/g, ' ');
                    schedule = work[1].lastChild.textContent.replace(/[<!-- -->]/g, ' ');
                  } else {
                    employment = work[0].childNodes[1].textContent.replace(/[<!-- -->]/g, ' ');
                    schedule = work[0].lastChild.textContent.replace(/[<!-- -->]/g, ' ');
                  }
                  obj.table.push({Name: name, Gender: gender, Age: age, Employment: employment, Schedule: schedule, Skills: skills});
                }
              )
          }
        )
      }
    )
    
setTimeout(
  function() {
    const json = JSON.stringify(obj);
    fs.writeFileSync('result.json', json);
  },
  2000
)
