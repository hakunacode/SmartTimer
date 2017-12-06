'use strict';

function $(s) {
	return document.querySelector(s);
}

var settings = {};
var bgpage = chrome.extension.getBackgroundPage();

chrome.storage.sync.get(null, function (sett) {
	settings = sett;
	init();
});

function init() {
	openDisplay(settings.currentDisplay);
	alarmAudio.checked = settings.enableAlarmAudio;
	timerAudio.checked = settings.enableTimerAudio;
	timerHours.value = checkValue(settings.timer.values.hours);
	timerMinutes.value = checkValue(settings.timer.values.minutes);
	timerSeconds.value = checkValue(settings.timer.values.seconds);
	alarmHours.value = checkValue(settings.alarm.values.hours);
	alarmMinutes.value = checkValue(settings.alarm.values.minutes);
	stopwatchOutput.innerHTML = settings.stopwatch.values;
}

function outputAddZero(elValue) {
	if (elValue < 10) {
		if (elValue.length != 2) return '0' + elValue;else return elValue;
	} else return elValue;
}

function checkValue(val) {
	if (val === 0) {
		return '';
	} else {
		return outputAddZero(val);
	}
}

document.body.addEventListener('click', function () {
	addSettings();
});

// # Catch
var dismiss = $('#dismiss'),
    catchBlock = $('.widget__catch'),
    catchWord = $('#catchWord'),
    catchTime = $('#catchTime');

function catchOpen(word) {
	var dateNow = new Date();
	catchTime.innerHTML = outputAddZero(dateNow.getHours()) + ':' + outputAddZero(dateNow.getMinutes());
	catchBlock.style.display = 'flex';
	if (word) {
		catchWord.innerHTML = word;
		return true;
	} else catchWord.innerHTML = 'Alarm';
}

dismiss.addEventListener('click', function () {
	catchBlock.style.display = 'none';
	bgpage.notice.pause();
	bgpage.notice.currentTime = 0;
});

// # Alarm
var alarmHours = $('#alarmHours'),
    alarmMinutes = $('#alarmMinutes'),
    alarmAudio = $('#enableAlarmAudio'),
    alarmOutput = $('#alarmOutput'),
    alarmInput = $('#alarmInput'),
    setAlarm = $('#setAlarm'),
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    date = null,
    countDownDate = bgpage.alarm.countDownDate || null,
    alarmTimeout = null,
    alarmInterval = null;

setAlarm.addEventListener('click', function () {
	if (bgpage.alarm.started) alarmStop();else {
		date = new Date(), countDownDate = new Date(months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + (alarmHours.value || 0) + ':' + (alarmMinutes.value || 0)).getTime();
		if (date.getTime() > countDownDate) countDownDate = new Date(months[date.getMonth()] + ' ' + (date.getDate() + 1) + ', ' + date.getFullYear() + ' ' + (alarmHours.value || 0) + ':' + (alarmMinutes.value || 0)).getTime();
		if (alarmHours.value == '') alarmHours.value = '00';
		if (alarmMinutes.value == '') alarmMinutes.value = '00';
		addSettings();
		alarmStart();
	}
});

alarmHours.addEventListener('keydown', function () {
	setTimeout(function () {
		if (alarmHours.value >= 24) alarmHours.value = '00';
	}, 10);
});

function alarmStart() {
	alarmOutput.style.display = 'flex';
	alarmInput.style.display = 'none';
	bgpage.alarm.started = true;
	bgpage.alarm.countDownDate = countDownDate;
	bgpage.alarm.buttonText = 'Cancel';
	setAlarm.innerHTML = bgpage.alarm.buttonText;
	alarmPlay();
}

function alarmStop() {
	clearTimeout(alarmTimeout);
	alarmOutput.innerHTML = '';
	alarmOutput.style.display = 'none';
	alarmInput.style.display = 'flex';
	bgpage.alarm.started = false;
	bgpage.alarm.buttonText = 'Set';
	setAlarm.innerHTML = bgpage.alarm.buttonText;
}

function alarmPlay() {
	if (bgpage.alarmStartCount(countDownDate)) {
		alarmOutput.innerHTML = bgpage.alarmStartCount(countDownDate);
	} else {
		catchOpen('Alarm');
		alarmStop();
		if (alarmAudio.checked) bgpage.notice.play();
		return;
	}
}

// # Clock
var nowDate = $('#nowDate'),
    nowTime = $('#nowTime');

function getNowDate() {
	var date = new Date(),
	    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	    minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
	    hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();

	nowDate.innerHTML = days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
	nowTime.innerHTML = hours + ':' + minutes;
};

// # Timer
var timerHours = $('#timerHours'),
    timerMinutes = $('#timerMinutes'),
    timerSeconds = $('#timerSeconds'),
    timerAudio = $('#enableTimerAudio'),
    timerOutput = $('#timerOutput'),
    timerInput = $('#timerInput'),
    resetTimer = $('#resetTimer'),
    setTimer = $('#setTimer'),
    timerTime = bgpage.timer.countDownDate || null,
    timerDate = new Date();

setTimer.addEventListener('click', function () {
	if (bgpage.timer.started) timerStop();else {
		if (!(timerSeconds.value == false && timerMinutes.value == false && timerHours.value == false)) {
			timerDate = new Date().getTime();
			timerTime = timerDate + timerHours.value * 3600000 + timerMinutes.value * 60000 + timerSeconds.value * 1000;
			if (timerHours.value == '') timerHours.value = '00';
			if (timerMinutes.value == '') timerMinutes.value = '00';
			if (timerSeconds.value == '') timerSeconds.value = '00';
			addSettings();
			timerStart();
		}
	}
});

resetTimer.addEventListener('click', function () {
	timerStop();
	timerHours.value = '';
	timerMinutes.value = '';
	timerSeconds.value = '';
});

function timerStop() {
	setTimer.classList.remove('active');
	timerOutput.style.display = 'none';
	timerInput.style.display = 'flex';
	bgpage.timer.started = false;
}

function timerStart() {
	setTimer.classList.add('active');
	timerOutput.style.display = 'flex';
	timerInput.style.display = 'none';
	bgpage.timer.countDownDate = timerTime;
	bgpage.timer.started = true;
	timerPlay();
}

function timerPlay() {
	if (bgpage.timerStartCount(timerTime)) {
		timerOutput.innerHTML = bgpage.timerStartCount(timerTime);
	} else {
		if (timerAudio.checked) bgpage.notice.play();
		catchOpen('Timer');
		timerStop();
		return;
	}
}

// # Stopwatch
var stopwatchOutput = $('#stopwatchOutput'),
    setStopwatch = $('#setStopwatch'),
    resetStopwatch = $('#resetStopwatch'),
    stopwatchResults = null;

setStopwatch.addEventListener('click', function () {
	if (bgpage.stopwatch.started) {
		stopwatchResults = bgpage.stopwatchCount(bgpage.stopwatch.time);
		bgpage.stopwatch.distance = stopwatchResults.distance;
		stopwatchStop();
	} else {
		bgpage.stopwatch.time = new Date().getTime() - (bgpage.stopwatch.distance || 0);
		stopwatchStart();
	}
});

resetStopwatch.addEventListener('click', function () {
	stopwatchStop();
	stopwatchOutput.innerHTML = '0:00.00';
	bgpage.stopwatch.distance = null;
	bgpage.stopwatch.time = new Date().getTime();
});

function stopwatchStart() {
	bgpage.stopwatch.started = true;
	setStopwatch.classList.add('active');
	stopwatchPlay();
}

function stopwatchStop() {
	bgpage.stopwatch.started = false;
	setStopwatch.classList.remove('active');
}

function stopwatchPlay() {
	var result = bgpage.stopwatchCount(bgpage.stopwatch.time);

	if (result.result) {
		stopwatchOutput.innerHTML = result.result;
	} else {
		stopwatchStop();
	}
}

var timeoutPopup = function timeoutPopup() {
	getNowDate();

	if (bgpage.alarm.started) alarmStart();else alarmStop();

	if (bgpage.timer.started) timerStart();else timerStop();

	setTimeout(timeoutPopup, 100);
};timeoutPopup();

var timeoutPopupStopwatch = function timeoutPopupStopwatch() {
	if (bgpage.stopwatch.started) stopwatchStart();
	setTimeout(timeoutPopupStopwatch, 10);
};timeoutPopupStopwatch();

// # Tabs
var widgetTab = document.getElementsByClassName('widget__tab');
var widgetDisplay = document.getElementsByClassName('widget__display');

tippy('.widget__tab', {
	trigger: 'mouseenter'
});

for (var i = 0; i < widgetTab.length; i++) {
	widgetTab[i].addEventListener('click', function () {
		var display = this.dataset.tabBtn;
		openDisplay(display);
	});
};

var inputs = document.getElementsByClassName('widget__input');
for (var _i = 0; _i < inputs.length; _i++) {
	inputs[_i].addEventListener('keydown', function (e) {
		var charCode = e.which ? e.which : event.keyCode;
		var thisEl = this;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) e.preventDefault();

		setTimeout(function () {
			if (thisEl.value >= 60) thisEl.value = '59';
		}, 10);
	});

	inputs[_i].addEventListener('click', function (e) {
		this.select();
	});

	inputs[_i].addEventListener('keyup', function (e) {
		addSettings();
	});
}

function openDisplay(display) {
	for (var _i2 = 0; _i2 < widgetTab.length; _i2++) {
		if (widgetTab[_i2].dataset.tabBtn === display) widgetTab[_i2].classList.add('active');else widgetTab[_i2].classList.remove('active');
	}
	for (var _i3 = 0; _i3 < widgetDisplay.length; _i3++) {
		if (widgetDisplay[_i3].dataset.tab === display) widgetDisplay[_i3].classList.add('show');else widgetDisplay[_i3].classList.remove('show');
	}
	chrome.storage.sync.set({ currentDisplay: display });
}

function addSettings() {
	chrome.storage.sync.set({
		enableAlarmAudio: alarmAudio.checked,
		enableTimerAudio: timerAudio.checked,
		stopwatch: {
			values: stopwatchOutput.innerHTML
		},
		timer: {
			values: {
				hours: timerHours.value || 0,
				minutes: timerMinutes.value || 0,
				seconds: timerSeconds.value || 0
			}
		},
		alarm: {
			values: {
				hours: alarmHours.value || 0,
				minutes: alarmMinutes.value || 0
			}
		}
	});
	bgpage.alarm.audio = alarmAudio.checked;
	bgpage.timer.audio = timerAudio.checked;
}