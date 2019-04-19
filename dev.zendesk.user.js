// ==UserScript==
// @name          DEV Thanx Zendesk Admin Linker
// @namespace     https://admin.thanx.com
// @description   A basic example of Greasemonkey that causes an alert at each page load.
// @include       https://thanx.zendesk.com/*
// @version       2.0
// ==/UserScript==

var main = function(){
	var moo = document.createElement('script');
	moo.src = "https://www.dropbox.com/s/yxzk3rjfg2baqqy/mootools.js?raw=1";
	moo.onload = function(){
		var scr = document.createElement('script');
		scr.src = "https://www.dropbox.com/s/9hcf4p4ix2ie8v1/dev.zendesk.js?raw=1";
		document.head.appendChild(scr);
		console.log('this is dev!');
	};
	document.head.appendChild(moo);

};


// Inject our main script
var script = document.createElement('script');
script.type = "text/javascript";
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);
