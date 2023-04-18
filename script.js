/**
 * -----------------------------------------------------------------------------
 * Stuff to run on load
 * -----------------------------------------------------------------------------
*/
// create events for cv timeline
cveventList = [
    // education
    createCVEvent("BASIS OV HS","2013","2017",true,"BASIS"),
    createCVEvent("University of Washington","2017-06","2018-05",true,"UW"),
    createCVEvent("ASU Bachelor's","2018-06","2021-05",true,"ASUB"),
    createCVEvent("ASU Master's","2021-06","2022-12-14",true,"ASUM"),
    //work
    createCVEvent("Born","1999-03","1999-04",false,"BORN"),
    createCVEvent("Learning Assistant","2019-06","2020-05",false,"ASULA"),
    createCVEvent("Research Assistant","2020-05","2021-05",false,"ASURA"),
    createCVEvent("Graduate Teaching Assistant","2021-06","2022-12-17",false,"ASUTA"),
    createCVEvent("Career Break","2023-01","2023-03",false,"DEP"),
    createCVEvent("Job Search","2023-03",null,false,"CARSRC")
];

var cvTransitionEventLocked = false;
var currentCVevent = -1;
const currentCVtext = {
    is_edu: false,
    l: -1,
    r: -1,
} // keeps track of text bounds info for working with overlapping text
document.getElementById("cvdefault").classList.add('active');
constructCVEventTimeline();


/**
 * -----------------------------------------------------------------------------
 *  Beginning of function defs
 * -----------------------------------------------------------------------------
 */
function createCVEvent(i_name, i_start_date, i_end_date, i_is_education,i_tag) {
    

    const eventobj = {
        name: i_name,
        start_date: new Date(i_start_date),
        end_date: new Date(i_end_date),
        is_education: i_is_education,
        tag: i_tag
    };

    if (i_end_date == null) {
        eventobj.end_date = new Date();
    }

    return eventobj;
}

// TODO: make system for dealing with overlapping events
function constructCVEventTimeline() {
    var timelinebox = document.getElementById('cvtimeline');
    var currentDate = new Date();
    var timelineFirstYear = new Date("1999");
    var timelineFinalYear = new Date((currentDate.getUTCFullYear()+1).toString());
    var totalTime = timelineFinalYear.getTime() - timelineFirstYear.getTime();

    // work events
    var html_to_add = "<svg>\n";
    for (let iter = 0; iter < cveventList.length; iter++) {
        if (!cveventList[iter].is_education) {
            let startprop = (cveventList[iter].start_date.getTime()-timelineFirstYear.getTime()) / totalTime * 100;
            let endprop = (cveventList[iter].end_date.getTime()-timelineFirstYear.getTime()) / totalTime * 100;
            html_to_add += `<g class="event" id="cveventrect${iter}" onmouseover="onCVEventMouseOver(${iter})" onmouseout="onCVEventMouseExit(${iter})" onclick="onCVEventClicked(${iter})">` +
            `<line x1="${startprop}%" y1="50%" x2="${startprop}%" y2="100%"/>` +
            `<rect x="${startprop}%" y="50%" width="${endprop-startprop}%" height="25%"/>` +
            `<line x1="${endprop}%" y1="50%" x2="${endprop}%" y2="100%" />` +
            `<text x="${(startprop + endprop)/2}%" y="25%" class="fade-down">${getDisplayText(iter)}</text>` +
            `</g>\n`;
            if (endprop < 0) {
                console.log(cveventList[iter].name);
                console.log(cveventList[iter].end_date);
            }
        }
    }
    html_to_add += "</svg>\n";

    html_to_add += `<svg class="timeline">
    <line x1="0%" y1="50%" x2="100%" y2="50%" />\n`;
    // add year lines
    var numLines = timelineFinalYear.getUTCFullYear() - timelineFirstYear.getUTCFullYear();
    for (let iter = 0; iter <= numLines; iter++) {
        let prop = iter/numLines * 100;
        let thisYear = iter + timelineFirstYear.getUTCFullYear();
        if (thisYear % 5 == 0) {
            html_to_add += `<line x1="${prop}%" y1="0%" x2="${prop}%" y2="100%" />\n`;
            if (thisYear != numLines) {
                html_to_add += `<text x="${prop+0.3}%" y="100%">${thisYear}</text>\n`;
            }
        } else {
            html_to_add += `<line x1="${prop}%" y1="25%" x2="${prop}%" y2="75%" />\n`;
        }
    }
    html_to_add += `</svg>`;

    // education events
    html_to_add += "<svg>\n";
    for (let iter = 0; iter < cveventList.length; iter++) {
        if (cveventList[iter].is_education) {
            let startprop = (cveventList[iter].start_date.getTime()-timelineFirstYear.getTime()) / totalTime * 100;
            let endprop = (cveventList[iter].end_date.getTime()-timelineFirstYear.getTime()) / totalTime * 100;
            html_to_add += `<g class="event" id="cveventrect${iter}" onmouseover="onCVEventMouseOver(${iter})" onmouseout="onCVEventMouseExit(${iter})" onclick="onCVEventClicked(${iter})">` +
            `<line x1="${startprop}%" y1="0%" x2="${startprop}%" y2="50%"/>` +
            `<rect x="${startprop}%" y="25%" width="${endprop-startprop}%" height="25%" />` +
            `<line x1="${endprop}%" y1="0%" x2="${endprop}%" y2="50%" />` +
            `<text x="${(startprop + endprop)/2}%" y="100%" class="fade-up">${getDisplayText(iter)}</text>` +
            `</g>\n`;
        }
    }
    html_to_add += "</svg>\n";

    timelinebox.innerHTML = html_to_add;

    //scroll to end
    timelinebox.scrollLeft= timelinebox.scrollWidth;
}

function getDisplayText(i) {
    if (cveventList[i].start_date.getFullYear() == cveventList[i].end_date.getFullYear()) {
        return cveventList[i].name;
    } else {
        return cveventList[i].name;
    }
}

// event handling

function onCVEventMouseOver(i) {
    if (i != currentCVevent) {
        let cvrect = document.getElementById('cveventrect' + i);
        let texttag = cvrect.lastChild;
        if (currentCVevent != -1 && (cveventList[i].is_education == currentCVtext.is_edu)) {
            let thisleft = texttag.getBoundingClientRect().left;
            let thisright = texttag.getBoundingClientRect().right;
            if (thisleft < currentCVtext.r && thisright > currentCVtext.l) {
                texttag.classList.add("activeelevated");
            } else {
                texttag.classList.add("active");
            }
        } else {
            texttag.classList.add("active");
        }
    }
}

function checkTextOverlap(i) {
    let cvrect = document.getElementById('cveventrect' + i);
    let texttag = cvrect.lastChild;
    
}

function onCVEventMouseExit(i) {
    if (i != currentCVevent) {
        removeCVLabel(i);
    }
}

function removeCVLabel(i) {
    let cvrect = document.getElementById('cveventrect' + i);
    let texttag = cvrect.lastChild;
    texttag.classList.remove("active");
    texttag.classList.remove("activeelevated");
}

function onCVEventClicked(i) {
    if (!cvTransitionEventLocked){
        cvTransitionEventLocked = true;
        let goLeft = eventIsBefore(currentCVevent,i);
        let target = null;
        if (currentCVevent != -1) { // remove old selected
            document.getElementById("cveventrect" + currentCVevent).style.opacity = null;
            target = document.getElementById("cv"+cveventList[currentCVevent].tag);
            removeCVLabel(currentCVevent);
        } else {
            target = document.getElementById("cvdefault");
        }
        target.classList.remove("active");
        target.style.display = "flex";
        target.style.animation = 'none';
        target.offsetHeight; // trigger reflow
        if (goLeft) {
            target.style.animation = "fade-out-left 0.3s ease-in";
        } else {
            target.style.animation = "fade-out-right 0.3s ease-in";
        }
        setTimeout(function() {target.style.display = null; cvTransitionEventLocked = false; bringInNewcvEvent(i); }, 300); // allow time to disappear
    }
}

function bringInNewcvEvent(i) {
    let goLeft = eventIsBefore(currentCVevent,i);
    currentCVevent = i;
    let cvrect = document.getElementById('cveventrect' + currentCVevent);
    let texttag = cvrect.lastChild;
    texttag.classList.remove("activeelevated");
    texttag.classList.add("active");
    cvrect.style.opacity = 1;
    let target = document.getElementById("cv"+cveventList[i].tag);

    target.classList.add("active");
    target.style.animation = 'none';
    target.offsetHeight; // trigger reflow
    if (goLeft) {
        target.style.animation = "fade-out-right 0.3s ease-in reverse";
    } else {
        target.style.animation = "fade-out-left 0.3s ease-in reverse";
    }
    // update cvtext tracker
    currentCVtext.is_edu = cveventList[currentCVevent].is_education;
    currentCVtext.l = texttag.getBoundingClientRect().left;
    currentCVtext.r = texttag.getBoundingClientRect().right;
}

function eventIsBefore(i,j) {
    if ((i < 0) || (j < 0)) {
        return true;
    }
    return cveventList[i].start_date <= cveventList[j].start_date;
}

function filterProjects(thisFilter) {
    if (thisFilter.classList.contains("active")) {
        thisFilter.classList.remove("active");
        thisFilter.firstChild.checked = false;

        // remove filter from projectviewer
    } else {
        thisFilter.classList.add("active");
        thisFilter.firstChild.checked = true;

        // apply filter to projectViewer
    }
}