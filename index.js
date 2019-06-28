const tress = require('tress');
const needle = require('needle');
const fs = require('fs');
const DomParser = require('dom-parser');
const parser = new DomParser();
const URL = 'https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&experience=noExperience&no_magic=false&order_by=relevance&search_period=30&skill=3864&page=0';
const result = [];

const queryMain = tress( (url, callback) => {
  needle(url, (err, res) => {
    if(err) throw err;

    const document = parser.parseFromString(res.body);
    const resumeArr = Array.from(document.getElementsByClassName('resume-search-item__name'));
    resumeArr.forEach( (el)=> {
      queryResume.push(`https://jobs.tut.by${el.getAttribute('href')}`);
    } )

    const nextPage = Array.from(document.getElementsByClassName('bloko-button.HH-Pager-Controls-Next'));
    nextPage.forEach((el) => {
      url = (`https://jobs.tut.by${el.getAttribute('href')}`);
      queryMain.push(url);

    })

  })
  callback();
} )

const queryResume = tress( (url, callback) => {
  needle(url, (err, res) => {
    if(err) throw err;
    
    const document = parser.parseFromString(res.body);
    
    //Name
    const nameArr = Array.from(document.getElementsByTagName('title'));
    let name = nameArr[0].innerHTML;
    nameArr.forEach((el) => {
      name = el.innerHTML;
    })

    //Salary
    const salaryArr = Array.from(document.getElementsByClassName('resume-block__salary'));
    let salary;
    salaryArr.forEach((el) => {
      salary = el.innerHTML;
    })
    
    //Gender&Age 
    const bio = Array.from(document.getElementsByClassName('resume-header-block'));
    let gender, birth;
    bio.forEach((el) => {
      gender = el.firstChild.firstChild.innerHTML;
      birth = el.firstChild.lastChild.getAttribute('content');
    })

    switch (undefined) {
    case (name): name = "Not mentioned";
      break;
    case (salary): salary = "Not mentioned";
      break;
    case (gender): gender = "Not mentioned";
      break;
    }
    if(birth === null) {
      birth = "Not mentioned";
    }

  result.push({ name, salary, gender, birth });
  })
  callback();
} )

queryMain.drain = function () {
  queryResume.drain = function () {
    fs.writeFileSync('result.json', JSON.stringify(result, null, 4));
  }
}

queryMain.push(URL);