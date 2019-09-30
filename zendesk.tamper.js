// ==UserScript==
// @name          Thanx Zendesk Admin Linker
// @namespace     https://admin.thanx.com
// @description   A basic example of Greasemonkey that causes an alert at each page load.
// @include       https://thanx.zendesk.com/*
// @version       2.0
// ==/UserScript==

var main = function(){
	var moo = document.createElement('script');
	moo.src = "https://rawcdn.githack.com/anutron/zendesk/74357fe49d605842e29935222d85172e90ccb35a/mootools.js";
	moo.onload = function(){
		var scr = document.createElement('script');
		scr.src = "https://rawcdn.githack.com/anutron/zendesk/74357fe49d605842e29935222d85172e90ccb35a/zendesk.js";
		document.head.appendChild(scr);
	};
	document.head.appendChild(moo);

};


// Inject our main script
var script = document.createElement('script');
script.type = "text/javascript";
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);
