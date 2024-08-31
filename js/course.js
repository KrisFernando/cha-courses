let speech = new SpeechSynthesisUtterance();
let voices = [];
let voiceSelect = document.querySelector("#voices");
let speedSelect = document.querySelector("#speed");
let autoplay = false;
let view = "learn";
let currentSection = 1;
let currentQuestion = 1;
let prevLock = true;
let nextLock = false;
let max = 0;
let debug = false;
let defaultvoice = 0;
let defaultspeed = "1";
var lastId;
let courseCode = getCourseCode();
let add = getCourseCode2();

function getCourseCode(){
    let temp = window.location.href.split("/");
    return temp[temp.length-2];    
}

function getCourseCode2(){
    let temp = window.location.href.split("/");
    if (temp[temp.length-4] == "cha-courses") {
        return "cha-courses/";
    } else {
        return "";
    }   
}


if (debug) console.log(getCourseCode2());
if (debug) console.log(getCourseCode());
if (debug) console.log("autoplay: " + autoplay);

start();

document.querySelector("#home").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    window.location.href = "../../dashboard.htm";
})

window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    voices.forEach((voice, i) => (voiceSelect.options[i] = new Option(voice.name, i)));
    speech.voice = voices[defaultvoice];
    voiceSelect.value = defaultvoice;
}

voiceSelect.addEventListener("change", () => {
    window.speechSynthesis.cancel();
    speech.voice = voices[voiceSelect.value];
    if (debug) console.log("voice: "+voiceSelect.value);
    setCookie("voice", voiceSelect.value, "");
})

speedSelect.addEventListener("change", () => {
    window.speechSynthesis.cancel();
    defaultspeed = speedSelect.value;
    speech.rate = parseFloat(defaultspeed);
    if (debug) console.log("speed: "+defaultspeed);
    setCookie("speed", defaultspeed, "");
})

document.querySelector("#auto").addEventListener("change", () => {
    autoplay = document.querySelector("#auto").checked;
    setCookie("autoplay", autoplay, "");
    if (debug) console.log("autoplay: " + autoplay);
})

document.querySelector("#play").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    playSection(0);
})

document.querySelector("#stop").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    if (debug) console.log(document.cookie);
})

document.querySelector("#prev").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    let index = 0;
    if (view == "learn") {
        index = currentSection - 1;
    } else {
        index = currentQuestion - 1;
        document.querySelector("#quizhint").innerHTML = "";
    }
    updateProcessBar(index);
    if (debug) console.log('#section' + parseInt(index + 1));
    scrollSmoothTo('section' + parseInt(index + 1));
    checkNav(index);
    showContent(index);
})

document.querySelector("#next").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    let index = 0;
    if (view == "learn") {
        index = currentSection + 1;
    } else {
        index = currentQuestion + 1;
        document.querySelector("#quizhint").innerHTML = "";
    }
    updateProcessBar(index);
    if (debug) console.log('#section' + parseInt(index));
    //scrollSmoothTo('section' + parseInt(index + 1));
    checkNav(index);
    showContent(index);
})

document.querySelector("#fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        let player = document.querySelector('body');
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.webkitRequestFullscreen) { /* Safari */
            player.webkitRequestFullscreen();
        } else if (player.msRequestFullscreen) { /* IE11 */
            player.msRequestFullscreen();
        }
    }
})

function checkNav(index) {
    if (index == 1) {
        prevLock = true;
    } else {
        prevLock = false;
    }
    if (index == max) {
        nextLock = true;
    } else {
        nextLock = false;
    }
    if (view == "learn") {
        currentSection = index;
    } else {
        currentQuestion = index;
    }
    learningComplete(index);
    updateNav();
}

function learningComplete(index) {
    lock = getCookieVal("QLock","true");
    if (index == max && view == "learn") {
        document.querySelector("#quiz").classList.remove("disabled");
        setCookie("QLock", "false", add+"courses/"+courseCode);
    }
    if(lock == "false") { document.querySelector("#quiz").classList.remove("disabled"); }
}

function updateNav() {
    if (prevLock) {
        document.querySelector("#prev").classList.add("disabled");
    } else {
        document.querySelector("#prev").classList.remove("disabled");
    }
    if (view == "learn") {
        if (nextLock) {
            document.querySelector("#next").classList.add("disabled");
        } else {
            document.querySelector("#next").classList.remove("disabled");
        }
    } else {
        if (debug) console.log("next lock? " + nextLock + " next question? " + checkAnswerCorrect());
        if (nextLock) {
            document.querySelector("#next").classList.add("disabled");
        } else {
            if (checkAnswerCorrect()) {
                document.querySelector("#next").classList.add("disabled");
            } else {
                document.querySelector("#next").classList.remove("disabled");
            }
        }
    }
}

function checkAnswerCorrect() {
    return !document.querySelector("#q" + currentQuestion).classList.contains("right");
}

function showContent(index) {
    if (view == "learn") {
        document.querySelector(".carousel-item.active").classList.remove("active");
        document.querySelector("#slide" + parseInt(index)).classList.add("active");
        document.querySelector(".learnsection.active").classList.remove("active");
        document.querySelector("#section" + parseInt(index)).classList.add("active");
        document.querySelector("#content").scrollTop = 0;
        currentSection = parseInt(index);
        setCookie("L", index, add+"courses/"+courseCode);
        if (debug) console.log("setcookie/ current: section" + index + " " + courseCode + " " + (currentSection));
    } else {
        document.querySelector(".questions.active").classList.remove("active");
        document.querySelector("#q" + parseInt(index)).classList.add("active");
        currentQuestion = parseInt(index);
        if (debug) console.log("current: question" + (currentQuestion));
        if (index == max) { 
            celebrate(); 
            setCookie(courseCode, "completed", "");
        }
    }
    speedSelect.value = defaultspeed;
    if (autoplay) {
        document.querySelector("#auto").checked = autoplay;
        playSection(index);
    }    
}

function getCookieVal(input, def, type = "s"){
    cookie = getCookie(input);
    if(cookie == "" ) {
        return def;
    } else {
        if(type == "s") {
            return cookie;
        } else if(type == "b") {
            return (cookie === "true");
        }
         else {
            return parseInt(cookie);
        }
    }
}

function start() {
    let index = 0;
    window.speechSynthesis.cancel();
    defaultvoice = getCookieVal("voice",0,"i");
    defaultspeed = getCookieVal("speed","1");
    view = getCookieVal("view","learn");
    autoplay = getCookieVal("autoplay",false,"b");
    currentSection = getCookieVal("L",1,"i");
    currentQuestion = 1;
    if (view == "learn") {
        index = currentSection;
        max = parseInt(document.querySelectorAll(".learn section h2").length);
    } else {
        index = currentQuestion;
        max = parseInt(document.querySelectorAll(".quiz section h3").length);
    }
    if (debug) console.log("speed: " + defaultspeed);
    if (debug) console.log(view + " index: " + index + " max: " + max);
    updateTab(view);
    checkNav(index);
    updateProcessBar(index);
    showContent(index);    
}

function updateProcessBar(section) {
    let current = 0;
    if (view == "learn") {
        currentSection = section;
        current = currentSection;
        max = parseInt(document.querySelectorAll(".learn section h2").length);
    } else {
        currentQuestion = section;
        current = currentQuestion;
        max = parseInt(document.querySelectorAll(".quiz section h3").length);
    }
    let interval = 100 / max;
    let progress = Math.ceil((interval) * (current));
    if (debug) console.log("max: " + (max) + " Interval: " + interval);
    if (debug) console.log("progress: " + progress + "%");
    document.querySelector("#progress").innerHTML = progress + "%";
    if (section == 1) {
        document.querySelector("#progress").style = "width: 10%;";
    } else {
        document.querySelector("#progress").style = "width: " + progress + "%;";
    }
}

function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();
    str = str.replaceAll('</li>', '!.');
    str = str.replaceAll('</b>', '!.');
    str = str.replaceAll('</h2>', '!.');
    str = str.replaceAll('</h3>', '!.');
    str = str.replaceAll('</p>', '!.');
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '').trim();
}

document.querySelectorAll('ul.no-bullets li').forEach( element => { 
    let prefix = element.innerHTML.split('.')[0];
    if(element.innerHTML.indexOf('.') > 0) { element.innerHTML = element.innerHTML.replace(prefix+".", `<b>` + prefix+"." + `</b>`) }
})

document.querySelectorAll('ul li').forEach( element => { 
    let prefix = element.innerHTML.split(':')[0];
    //console.log("indexOf ':'"+ element.innerHTML.indexOf(':') + " no-bullets:"+(!element.classList.contains("no-bullets")))
    if (!element.parentElement.classList.contains("no-bullets")) {
        //console.log(element.innerHTML+" indexOf ':'"+ element.innerHTML.indexOf(':') + " no-bullets:"+(element.classList.contains("no-bullets")))
        if(element.innerHTML.indexOf(':') > 0) {element.innerHTML = element.innerHTML.replace(prefix+":", `<b>` + prefix+":" + `</b>`)}
    } 
})

function scrollSmoothTo(elementId) {
    var element = document.getElementById(elementId);
    element.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
    });
}

function playSection(offset) {
    let section = 0;
    let content = "";
    let synth = window.speechSynthesis;
    content = document.querySelector("." + view + " section.active").innerHTML; 
    speech.text = removeTags(content).replace(/\s+/g, " ");
    if(view == "quiz" && (lastword(speech.text) == "Submit")) {speech.text = speech.text.substring(0, speech.text.lastIndexOf(" "))}
    if (debug) console.log("read text:" + speech.text);
    speech.rate = parseFloat(defaultspeed);
    window.speechSynthesis.speak(speech);
}

function lastword(words) {
    var n = words.split(" ");
    return n[n.length - 1];

}

document.querySelector("#learn").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    if (debug) console.log("tab: learn section:" + currentSection);
    view = "learn";
    updateTab(view)
    updateProcessBar(currentSection);
    checkNav(currentSection);
    showContent(currentSection);
    updateProcessBar(currentSection);
    setCookie("view","learn",add+"courses/"+courseCode);
})

document.querySelector("#quiz").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    if (debug) console.log("tab: quiz section:" + currentQuestion);
    view = "quiz";
    updateTab(view)
    updateProcessBar(currentQuestion);
    checkNav(currentQuestion);
    showContent(currentQuestion);
    updateProcessBar(currentQuestion);
    setCookie("view","quiz",add+"courses/"+courseCode);
})

function updateTab(view) {
    if (view == "quiz") {
        document.querySelector(".learn").classList.add("hide");
        document.querySelector(".quiz").classList.remove("hide");
        document.querySelector("#quiz").classList.add("active");
        document.querySelector("#learn").classList.remove("active");
        document.querySelector("#quiz").classList.remove("disabled");
    } else {
        document.querySelector(".quiz").classList.add("hide");
        document.querySelector(".learn").classList.remove("hide");
        document.querySelector("#learn").classList.add("active");
        document.querySelector("#quiz").classList.remove("active");
    }
}

document.querySelectorAll(".quizbutton").forEach(quizbutton => {
    let id = quizbutton.id.slice(0, -1);
    //if (debug) console.log('question' + id);
    quizbutton.addEventListener("click", () => {
        for (let i = 1; i <= 4; i++) {
            let answer = document.querySelector("#" + id + "-" + i);
            //if (debug) console.log("correct answer: " + answer.classList.contains("correct"));
            if ((answer.checked == true) && (answer.classList.contains("correct"))) {
                document.querySelector("#quizhint").innerHTML = "<h4>Result:</h><br/><br/><p>That is the correct answer.</p><p>Please click on the next button in the navigation controls at the bottom left of your screen, to proceed.</p>";
                document.querySelector("#quizhint").classList.add("correct");
                document.querySelector("#quizhint").classList.remove("incorrect");
                document.querySelector("label." + id + "-" + i).classList.add("right");
                document.querySelector("#" + id).classList.add("right");
            }
            if ((answer.checked == true) && (answer.classList.contains("incorrect"))) {
                document.querySelector("#quizhint").innerHTML = "<h4>Result:</h><br/><br/><p>Unfortunately, that is not the correct answer.</p><p>Please click on the Learning Material tab on the top right of your screen, to review the material for better insights.</p>";
                document.querySelector("#quizhint").classList.remove("correct");
                document.querySelector("#quizhint").classList.add("incorrect");
                document.querySelector("label." + id + "-" + i).classList.add("wrong");
                document.querySelector("#" + id).classList.remove("right");
            }
            updateNav();
        }
    });
})

for (let q = 1; q <= 5; q++) {
    for (let a = 1; a <= 4; a++) {
        document.querySelector(".q" + q + "-" + a).addEventListener("click", () => {
            //if (debug) console.log("q" + q + "-" + a + " clicked");
            clearAnswers(q);
            document.querySelector("#q" + q + "-" + a).setAttribute("checked", "checked");
        });
    }
}

function clearAnswers(id) {
    for (let a = 1; a <= 4; a++) {
        try { document.querySelector(".q" + id + "-" + a + ".right").classList.remove("right"); } catch (err) { }
        try { document.querySelector(".q" + id + "-" + a + ".wrong").classList.remove("wrong"); } catch (err) { }
    }
}

const canvas = document.querySelector('#confetti');
const jsConfetti = new JSConfetti();

function celebrate() {
    jsConfetti.addConfetti({
        emojis: ['🌟', '⭐', '💥', '✨', '💫', '👏'],
    }).then(() => jsConfetti.addConfetti())
}

function setCookie(cname, cvalue, path) {
    document.cookie = cname + "=" + cvalue + "; SameSite=None; Secure; expires=1 Jan 2030 12:00:00 UTC; path=/"+path+";";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}