/*
    This file is part of Caronte.
	
    Caronte is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 2 of the License.
	
    Caronte is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
	
    You should have received a copy of the GNU General Public License
    along with Nome-Programma; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
/*
 *    Base Lib
 *
 *    These functions are used by all classes.
 *    Some of them are needed by the HTML to include other JavaScript files.
 */


"use strict";


// this should contain all that is not callable by user and not in SW
var UTILE = {};

// error handler
window.onerror = function(err, url, line, stop)
{
	if (typeof err === "string") {
		// we have a message to display
		var out  = "Error: "  + err;
	} else {
		var out = "Error: Unknown";
		if (typeof err.srcElement !== "undefined" && typeof err.srcElement.id !== "undefined")
			out += "\nFile: " + err.srcElement.id;
		//for (var x in err) alert(x + ": " + err[x]);
	}
	
	// if we have url and line, display them
	if (url)           out += "\n" + "File: "    + url;
	if (line)          out += "\n" + "Line: "   + line;
	
	if (typeof modal != "undefined") {
		// if modal is ready, show error gracefully
		modal.bad(out.replace("\n", "<br>\n"));
	} else { // modal is not ready, use nasty alert()
		alert(out);
	}
}
UTILE.issue = window.onerror;


// application options will be loaded later
var options    = {};
UTILE.SWOptions  = {};

// functions constructors
UTILE.funcExts   = [];

// wait all passed objects are loaded, then execute func
var queue = function()
{
	// add new item to queue
	function add(func, objects, id)
	{
		list.push([func, objects, id]);
		if (list.length == 1) tryToExec();
	}
	
	// exec next item
	function tryToExec()
	{
		if (lock) return false;
		lock = true;
		
		// repeat loop on items until an item exist or a loop was useless
		while (true) {
			var itemLazy;              // current item is lazy?
			var itemExecuted = false;  // at least 1 item ecexuted?
			
			// loop on items
			for (var x in list) {
				// get item
				var item     = list[x];
				var func     = item[0];
				var objects  = item[1];
				var id       = item[2];
				
				// check objects validity
				if (objects == null) objects = [];
				else if (!UTILE.isArray(objects)) objects = [objects];
				
				// this item is lazy? (loop on objects)
				itemLazy = false;
				for (var y in objects) {
					// check current condition
					if (!checkCondition(objects[y])) itemLazy = true;
					if (itemLazy) break;
					//else alert("lazy " + objects[y]);
				}
				
				if (!itemLazy) {
					// item is ready! exec & drop it
					eval(func);
					list.splice(x, 1);
					done[id]  = true;
					itemExecuted   = true;
				}
			}
			// nothin more to do or nothin done
			if (list.length == 0 || !itemExecuted) break;
		}
		lock = false;
		if (list.length > 0) defer();
	}
	
	// condition is (alreay) satisfied?
	function checkCondition(cond)
	{
		// check condition type
		if (cond.charAt(0) == '?') {
			// starts with '?' - it's boolean condition
			cond = cond.substr(1);
			return !(eval(cond) === false);
		} else if (cond.charAt(0) == '@') {
			// starts with '@' - id of another task, is it done already?
			cond = cond.substr(1);
			return (typeof done[cond] != "undefined");
		} else {
			// no suffix: object
			return eval("typeof " + cond + " != 'undefined';");
		}
	}
	
	// set new timeout
	function defer()
	{
		window.setTimeout(function(queue){queue.tryToExec()}, millisec, queue);
	}
	
	// constructor
	var millisec  = 0;
	var list      = [];
	var done      = [];
	var lock      = false;  // prevents conflicts
	
	// public properties
	return {
		add        : add,
		tryToExec  : tryToExec
	};
}();

// defines all Caronte events
UTILE.defineEvents = function() {
	// define events
	this.events.define("GUIDraw", true);             // gui.draw()
	this.events.define("GUICreateArea", true);       // gui.createArea()
	this.events.define("PluginsReady", true);        // plugins
	this.events.define("PluginLoaded", true);        // plugins.add()
	this.events.define("ApplicationBegin", true);    // gioca()
	this.events.define("PageBegin", true);           // vai()
	this.events.define("PageEnd", true);             // vai()
}

// all themes avaible for the current app
UTILE.themes = function() {
	var list      = {};
	var selected;
	
	// empty list of themes
	function empty() {
		list = {};
	}
	
	// add a theme object to the list
	function add(id, name) {
		// in the future maybe more options will be avaible
		list[id] = {};
		list[id]["name"] = name;
	}
	
	// create/replace <style> tag
	function select(id) {
		// delete old links
		var links     = document.getElementsByTagName("link");
		var numLinks  = links.length;
		for (var i = 0; i < numLinks; i++) {
			UTILE.removeFromDOM(links[i]);
		}
		
		// remember new
		selected = id;
		
		// link new
		if (navigator.appName === 'Microsoft Internet Explorer') { // IE
			// define tag
			var tag = document.createElement("link");
			tag.setAttribute("rel",    "stylesheet");
			tag.setAttribute("type",   "text/css");
			tag.setAttribute("id",     "theme");
			tag.setAttribute("href",   "data/themes/" + id + "/main.css");
			// insert into DOM
			document.getElementById("headTag").appendChild(tag);
		} else { // decent browsers
			var sTag   = '<link rel="stylesheet" type="text/css" id="theme" href="data/themes/';
			sTag      += id;
			sTag      += '/main.css"></link>';
			document.getElementById("headTag").innerHTML += sTag;
		}
	}
	
	// return selected theme's id
	function getSelected() {
		return selected;
	}
	
	// expose public methods
	return {
		empty        : empty,
		add          : add,
		select       : select,
		getSelected  : getSelected
	}
}();

// includes js libs and calls adventure
function init() {
	// load libs, if not already loaded (restart)
	if (typeof SW === "undefined") {
		// localization
		queue.add("UTILE.link('js', 'data/libs/locale')");
		// messages
		queue.add("UTILE.link('js', 'data/libs/tinybox')", ["locale"]);
		// event handler
		queue.add("UTILE.link('js', 'data/libs/events')", ["modal"]);
		queue.add("UTILE.defineEvents()", ["UTILE.events"], "defineEvents");
		// output system
		queue.add("UTILE.link('js', 'data/libs/ui')", ["@defineEvents"]);
		// menu handler
		queue.add("UTILE.link('js', 'data/libs/menu')", ["gui"]);
		// game system
		queue.add("UTILE.link('js', 'data/libs/kernel')", ["UTILE.menuHandler"]);
		// load / config extensions
		queue.add("UTILE.link('js', 'data/libs/plugin_loader')", ["SW"]);
	}
	
	var appName = null;
	
	if (typeof document.URL !== "undefined")
		var URL = document.URL;
	else if (typeof window.location !== "undefined")
		var URL = window.location;
	else
		var URL = document.location.href;
	
	if (URL.indexOf("?") > 0 && URL.indexOf("?") < (URL.length - 1)) { // not last char
		var qs = URL.substring(document.URL.indexOf("?") + 1);
		var separatorPos = qs.indexOf("/");
		if (separatorPos === -1) {
			// only appName
			appName = qs;
		} else {
			// appName + params
			appName = qs.substr(0, separatorPos);
			var params = qs.substr(separatorPos + 1);;
			params = params.split("&");
			for (var x in params) {
				// divide keys from values
				var temp  = params[x].split("=");
				var key   = temp[0];
				var val   = temp[1] ? temp[1] : true;
				if (key.charAt(0) === "_") {
					UTILE.SWOptions[key.substr(1)] = val;
				} else {
					options[key] = val;
				}
			}
		}
	}
	
	if (appName === null) {
		// application configuration
		queue.add('UTILE.link("js", "apps/gioco_conf")',  [], "conf");
		queue.add('UTILE.link("js", "apps/gioco")',       ["plugins", "@conf"]);
	} else {
		// application configuration
		queue.add("UTILE.link('js', 'apps/" + appName + "/conf')", [], "conf");
		// application code
		queue.add("UTILE.link('js', 'apps/" + appName + "/main')", ["plugins", "@conf"]);
	}
	window.appName = appName;
	
	queue.add("SW.prepare('" + appName + "')", ["Inizia"]);
}

// given filetype and filename, returns id
//     @type    : string     : "js or "node"
//     @file    : string     : file path+name from data/
UTILE.libId = function(type, file) {
	return "__" + type + "_" + file.replace(/\//g, "_");
}

// remove a DOM element (cross browser, no exception if element not exist)
//     @id     : string     : node id
UTILE.removeFromDOM = function(id) {
	var el = document.getElementById(id);
	if (el != null && typeof el != "undefined")
		el.parentNode.removeChild(el);
}

// include 1 js lib with <SCRIPT>
// or 1 CSS stylesheet with <LINK>
//     @type    : string     : "js" for JavaScript, "css" for StyleSheet
//     @file    : string     : file path + name starting from "data"
UTILE.link = function(type, file)
{
	// define tag
	var tag = document.createElement("script");
	tag.setAttribute("type",    "text/javascript");
	tag.setAttribute("src",     file + ".js");
	tag.setAttribute("id",      this.libId(type, file));
	
	// insert into DOM
	document.getElementsByTagName("head")[0].appendChild(tag);
}

// removes <script> or <link> pointing to specified file
UTILE.unlink = function(type, file) {
	var id = this.libId(type, file);
	this.removeFromDOM(id);
}

// object which contains options
//     @userOptions     : Object    : options specified by user / extension
//     @defaultOptions  : Object    : default values, only used for unspecified options
UTILE.opt = function(userOptions, defaultOptions) {
	// accessor
	function get(o)
	{
		return list[o];
	}
	
	var list = {};
	
	// Constructor
	// set default values
	
	// write defaults (if any)
	if (defaultOptions != null) {
		for (var o in defaultOptions) {
			list[o] = defaultOptions[o];
		}
	}
	
	// overwrite defaults
	for (var o in userOptions) {
		list[o] = userOptions[o];
	}
	
	return {
		get    : get
	}
}


/*
 *    Array Functions
 *
 *    These methods need that items have an id
 */

// drop an item from Array and shift left next elements.
// return true (if item is found & removed) or false
//     @arr      : Array     : array
//     @item     : string    : item's id
UTILE.drop = function (arr, item) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].id == item) {
			// found; shift left all following items
			// current will be overwritten
			while (i < arr.length) {
				arr[i] = arr[i + 1];
				i++;
			}
			arr.pop();
			return true;
		}
	}
	return false;
}

// return true if input is an Array, else false
UTILE.isArray = function(input) {
	if (typeof input === 'undefined') {
		return false;
	}
	return input.constructor === Array;
}

// insert an item into Array and shift right next elements
//    @arr       : Array      : array
//    @item      : mixed      : new item for array
//    @position  : integer    : index for new item; null = last
UTILE.insert = function(arr, item, position) {
	if (position == null) {
		arr[arr.length] = item;
	} else {
		var i = arr.length - 1;
		while (i > position) {
			arr[i + 1] = arr[i];
			i--;
		}
		arr[i + 1] = arr[i];
		arr[i] = item;
	}
}

// given an array, returns item with specified id, null if not found
UTILE.getById = function(arr, id) {
	for (var i in arr) {
		if (arr[i].id == id) return arr[i];
	}
	return null;
}


/*
var arr = [0,1,2,3,4,5];
for (var i in arr) {
	arr[i]     = new Object();
	arr[i].id  = (i * 10);
}

alert(UTILE.getById(arr, 10).id);

UTILE.drop(arr, 20);

var abc = new Object;
abc.id = 100;

UTILE.insert(arr, abc);


for (var i in arr) {
	alert("[" + i + "] = " + arr[i].id);
}
*/
