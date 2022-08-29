let jobs = [];
let jobsToShow = [];
let cities = [];
let countries = [];
let sectors = [];
let filterdJobs = [];
let pageNumber = 1;
let jobsPerPage = 10;
let totalPages = 0;
// on created call jobs api and helper data country , city , sector
async function init() {
    await getHelperData();
    await getJobs();
    fillFormData();
    fillFilterSection();
    jobsToShow = jobs.slice(pageNumber * 10 - 10, pageNumber * 10);
    fillJobsList(jobsToShow);
}
// get all checked and return data
async function filterJobs() {
    const allSectionChecked = document.querySelectorAll('input[name="sectorSection"]:checked');
    const allCountryChecked = document.querySelectorAll('input[name="countrySection"]:checked');
    const allCityChecked = document.querySelectorAll('input[name="citySection"]:checked');
    let availableCities = [];
    if (allCountryChecked.length > 0 && allCityChecked.length == 0) {
        availableCities = cities.filter(city => {
            for (let i = 0; i < allCountryChecked.length; i++) {
                if (city.countryId == allCountryChecked[i].value) {
                    return true;
                }
            }
        });
        let citySelection = document.getElementById('cityFilter');
        citySelection.innerHTML = '';
        for (city in availableCities) {
            let cityCheckBox = document.createElement('div');
            cityCheckBox.innerHTML = "                    <div class=\"form-group\">\n" + "                        <input type=\"checkbox\" id=" + availableCities[city].value + " name=\"citySection\" value=" + availableCities[city].key + " \n" + "                            onclick=\"  filterJobs(); fillFilteredJobs();\" />\n" + "                        <label for=" + availableCities[city].value + "> " + availableCities[city].value + "</label>\n" + "                    </div>"
            citySelection.appendChild(cityCheckBox);
        }
    }
    if (allSectionChecked.length == 0 && allCountryChecked.length == 0 && allCityChecked.length == 0) {
        filterdJobs = jobs;
    } else {
        filterdJobs = jobs.filter(job => {
            if (allSectionChecked.length > 0) {
                for (let i = 0; i < allSectionChecked.length; i++) {
                    if (job.sector == allSectionChecked[i].value) {
                        return true;
                    }
                }
                return false;
            } else {
                return true;
            }
        });
        filterdJobs = filterdJobs.filter(job => {
            if (allCountryChecked.length > 0) {
                for (let i = 0; i < allCountryChecked.length; i++) {
                    if (job.country == allCountryChecked[i].value) {
                        return true;
                    }
                }
                return false;
            } else {
                return true;
            }
        });
        filterdJobs = filterdJobs.filter(job => {
            if (allCityChecked.length > 0) {
                for (let i = 0; i < allCityChecked.length; i++) {
                    if (job.city == allCityChecked[i].value) {
                        return true;
                    }
                }
                return false;
            } else {
                return true;
            }
        });
    }

}

function fillFilteredJobs() {
    fillJobsList(filterdJobs);
}
// call jobs api and store data in variable
async function getJobs() {
    await fetch("https://mockend.com/qusaijaradat/jobs-ui/job?limit=20").then(async (response) => {
        await response.json().then((data) => {
            jobs = data.sort((a, b) => (a.title > b.title) ? 1 : -1);
            filterdJobs = jobs;
            totalPages = Math.ceil(jobs.length / jobsPerPage);
        }).catch((error) => {
            console.log(error);
        });
    });


}
// delete job by id and get date after delete
async function deleteJob(id) {
    let searchElement = document.getElementById("search");
    searchElement.value = "";
    await fetch("https://mockend.com/qusaijaradat/jobs-ui/job/" + id, {method: 'DELETE'}).then(async (response) => {
        jobs = jobs.filter(item => item.id != id);
        fillJobsList(jobs);
    }).catch((error) => {
        console.log(error);
    }).finally(() => {
    });
}
// check if all field exist and add data in list
async function postJob() {
    let job = convertToJSON();
    if (job == null) {
        return;
    }
    await fetch("https://mockend.com/qusaijaradat/jobs-ui/job", {
        method: 'POST',
        body: JSON.stringify(job)
    }).then(async (response) => {
        await response.json().then((data) => {
            job.id = data.id;
            jobs.push(job);
            fillJobsList(jobs);
            showPopup(false)
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
                console.log("done");
            }
        );
    }).catch((error) => {
        console.log(error);
    });
}
//check if all field exist
function convertToJSON() {
    const title = document.getElementById('title').value;
    const sector = document.getElementById('sector').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const description = document.getElementById('description').value;

    if (title == '' || sector == '' || country == '' || city == '' || description == '') {
        alert('Please fill all fields');
        return;
    }
    return {
        "title": title,
        "sector": sector,
        "country": country,
        "city": city,
        "description": description,
    };
}
// fill data in list
function fillJobsList(jobs) {
    let jobsListElement = document.getElementById('jobItemList');
    jobsListElement.innerHTML = '';
    for (let job in jobs) {
        const cityName = getCityName(jobs[job].city, jobs[job].country) ? ", " + getCityName(jobs[job].city, jobs[job].country) : '';
        const countryName = getCountryName(jobs[job].country);
        const sectorName = getSectorName(jobs[job].sector);
        let jobItem = document.createElement('div');
        jobItem.innerHTML = "                    <div class=\"item\">\n" +
            "                        <div class=\"image\">\n" +
            "                            <img src=\"./images/default.png\" alt=\"default\" />\n" +
            "                        </div>\n" +
            "                        <div class=\"content\">\n" +
            "                            <div class=\"job-title\">" + jobs[job].title + "</div>\n" +
            "                            <div class=\"city-country\">" + countryName + cityName + "</div>\n" +
            "                            <div class=\"sector\">" + sectorName + "</div>\n" +
            "                            <div class=\"description\">" + jobs[job].description + "</div>\n" +
            "                        </div>\n" +
            "                        <div class=\"actions\">\n" +
            "                            <img src=\"./images/view.png\" onclick='viewJob(" + jobs[job].id + ")' alt=\"view\" />\n" +
            "                            <img src=\"./images/delete.png\" onclick='deleteJob(" + jobs[job].id + ")'  alt=\"delete\" />\n" +
            "                        </div>\n" +
            "                    </div>\n";
        jobsListElement.appendChild(jobItem);
    }
}
// get city , country and sector from data.json and store data in variable
async function getHelperData() {
    await fetch("./data.json").then(async (response) => {
            await response.json().then((data) => {
                cities = data.city;
                countries = data.country;
                sectors = data.sector;
            });
        }
    );
}
// fill country and sector after get data from json
function fillFilterSection() {

    let countrySelection = document.getElementById('countryFilter');
    let sectorSelection = document.getElementById('sectorFilter');


    for (let sector in sectors) {

        let sectorCheckBox = document.createElement('div');
        sectorCheckBox.innerHTML = "                    <div class=\"form-group\">\n" + "                        <input type=\"checkbox\" id=" + sectors[sector].value + " name=\"sectorSection\" value=" + sectors[sector].key + " \n" + "                            onclick=\"  filterJobs(); fillFilteredJobs();\" />\n" + "                        <label for=" + sectors[sector].value + "> " + sectors[sector].value + "</label>\n" + "                    </div>"
        sectorSelection.appendChild(sectorCheckBox);
    }
    for (let country in countries) {
        let countryCheckBox = document.createElement('div');
        countryCheckBox.innerHTML = "                    <div class=\"form-group\">\n" + "                        <input type=\"checkbox\" id=" + countries[country].value + " name=\"countrySection\" value=" + countries[country].key + " \n" + "                            onclick=\"  filterJobs();     fillFilteredJobs();\" />\n" + "                        <label for=" + countries[country].value + "> " + countries[country].value + "</label>\n" + "                    </div>"
        countrySelection.appendChild(countryCheckBox);
    }

}
// get city by id and countryId
function getCityName(key, countryId) {
    if (countryId == '')
        return '';
    return cities.find(city => city.key == key && city.countryId == countryId) ? cities.find(city => city.key == key && city.countryId == countryId).value : null;
}

function getCountryName(key) {
    return countries.find(country => country.key == key).value;
}

function getSectorName(key) {
    return sectors.find(sector => sector.key == key).value;
}

function fillFormData() {
    let countrySelection = document.getElementById('country');

    countrySelection.onchange = function () {
        let citySelection = document.getElementById('city');
        citySelection.innerHTML = '';
        let city = cities.filter(item => item.countryId == this.value);
        for (let cityItem in city) {
            let cityOption = document.createElement('option');
            cityOption.value = city[cityItem].key;
            cityOption.innerHTML = city[cityItem].value;
            citySelection.appendChild(cityOption);
        }
    }

    let sectorSelection = document.getElementById('sector');
    countrySelection.innerHTML = '<option value="" selected>Select Country</option>';
    sectorSelection.innerHTML = '<option value="" selected>Select Sector</option>';

    for (let country in countries) {
        let countryOption = document.createElement('option')
        countryOption.value = countries[country].key;
        countryOption.text = countries[country].value;
        countrySelection.add(countryOption);
    }
    for (let sector in sectors) {
        let sectorOption = document.createElement('option')
        sectorOption.value = sectors[sector].key;
        sectorOption.text = sectors[sector].value;
        sectorSelection.add(sectorOption);
    }
}

function searchJobsByTitle() {
    const title = document.getElementById('search').value;
    if (title == '') {

        return filterdJobs;
    }
    jobsToShow = filterdJobs.filter(job => job.title.toLowerCase().includes(title.toLowerCase()));
    return jobsToShow;
}
// pagination
function changePage(isNext) {

    if (isNext) {
        pageNumber++;
    } else {
        pageNumber--;
    }
    if (pageNumber == 1) {
        document.getElementById('previous').hidden = true;
    } else {
        document.getElementById('previous').hidden = false;
        if (pageNumber == totalPages) {
            document.getElementById('next').hidden = true;
        } else {
            document.getElementById('next').hidden = false;
        }
    }

    jobsToShow = jobs.slice((pageNumber - 1) * jobsPerPage, pageNumber * jobsPerPage);
    fillJobsList(jobsToShow);
}

function showPopup(show) {
    let elementPopup = document.getElementById('popup');
    let titlePopupElement = document.getElementById('titlePopup');
    let newAddBtn = document.getElementById('newAddBtn');
    let citySelection = document.getElementById('city');
    let countrySelection = document.getElementById('country');
    let sectorSelection = document.getElementById('sector');
    let title = document.getElementById('title');
    let description = document.getElementById('description');
    if (show) {
        elementPopup.style.visibility = 'visible'
        elementPopup.style.opacity = 'unset'
        titlePopupElement.innerHTML = "Add New Job Post";
        newAddBtn.style.display = "flex";
        title.value = ""
        description.value = ""
        sectorSelection.value = ""
        countrySelection.value = ""
        citySelection.value = ""
        title.disabled = false;
        description.disabled = false;
        sectorSelection.disabled = false;
        countrySelection.disabled = false;
        citySelection.disabled = false;
    } else {
        elementPopup.style.visibility = 'hidden'
        elementPopup.style.opacity = '0'
    }
}

function viewJob(id) {
    let popupElement = document.getElementById("popup");
    let citySelection = document.getElementById('city');
    let countrySelection = document.getElementById('country');
    let sectorSelection = document.getElementById('sector');
    let title = document.getElementById('title');
    let description = document.getElementById('description');
    let titlePopupElement = document.getElementById('titlePopup');
    let newAddBtn = document.getElementById('newAddBtn');
    let item = jobs.filter(job => job.id == id);
    if (item) {
        title.value = item[0].title;
        description.value = item[0].description;
        sectorSelection.value = item[0].sector;
        countrySelection.value = item[0].country;
        citySelection.value = item[0].city;
    }
    title.disabled = true;
    description.disabled = true;
    sectorSelection.disabled = true;
    countrySelection.disabled = true;
    citySelection.disabled = true;
    newAddBtn.style.display = 'none';
    titlePopupElement.innerHTML = 'View Job';
    popupElement.style.visibility = 'visible';
    popupElement.style.opacity = 'unset';
}