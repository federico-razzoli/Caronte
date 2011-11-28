/*
    This file is part of IDRA.
	
    IDRA is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 2 of the License.
	
    IDRA is distributed in the hope that it will be useful,
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

// error handler
window.onerror = function(err, url, line, stop)
{
	console.trace();
	var                out  =        "Error: "  + err.toString();
	if (url)           out += "\n" + "URL: "    + url;
	if (line != null)  out += "\n" + "Line: "   + line;
	if (typeof modal != "undefined") {
		// if modal is ready, show error gracefully
		modal.bad(out.replace("\n", "<br>\n"));
	} else {
		alert(out);
	}
}
var issue = window.onerror;


// application options will be loaded later
var options    = new Object();
var SWOptions  = new Object();

// functions constructors
var funcExts   = [];

// wait all passed objects are loaded, then execute func
var queue = new function()
{
	// adds new item to queue
	this.add = function(func, objects, id)
	{
		list.push([func, objects, id]);
		if (list.length == 1) this.tryToExec();
	}
	
	// exec next item
	this.tryToExec = function()
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
				else if (!isArray(objects)) objects = [objects];
				
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
	var checkCondition = function(cond)
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
	var defer = function()
	{
		window.setTimeout(function(queue){queue.tryToExec()}, millisec, queue);
	}
	
	// constructor
	var millisec  = 50;
	var list      = new Array;
	var done      = new Array;
	var lock      = false;  // prevents conflicts
}

// defines all IDRA events
function defineEvents()
{
	// define events
	events.define("GUIDraw", true);             // gui.draw()
	events.define("GUICreateArea", true);       // gui.createArea()
	events.define("PluginsReady", true);        // plugins
	events.define("PluginLoaded", true);        // plugins.add()
	events.define("ApplicationBegin", true);    // gioca()
	events.define("PageBegin", true);           // vai()
	events.define("PageEnd", true);             // vai()
}

// includes js libs and calls adventure
function init()
{
	// load libs, if not already loaded (restart)
	if (typeof SW === "undefined") {
		// default css
		link("css", "data/themes/classic/main");
		
		// localization
		queue.add("link('js', 'data/libs/locale')");
		// messages
		queue.add("link('js', 'data/libs/tinybox')", ["locale"]);
		// event handler
		queue.add("link('js', 'data/libs/events')", ["locale"]);
		queue.add("defineEvents()", ["events"]);
		// output system
		queue.add("link('js', 'data/libs/ui')", ["events", "?events.isDefined('PageEnd')"]);
		// game system
		queue.add("link('js', 'data/libs/kernel')", ["gui"]);
		// menu handler
		queue.add("link('js', 'data/libs/menu')", ["locale"]);
		// load / config extensions
		queue.add("link('js', 'data/libs/plugin_loader')", ["gui", "menuHandler", "events"]);
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
					SWOptions[key.substr(1)] = val;
				} else {
					options[key] = val;
				}
			}
		}
	}
	
	if (appName === null) {
		// application configuration
		queue.add('link("js", "apps/gioco_conf")',  [], "conf");
		queue.add('link("js", "apps/gioco")',       ["plugins", "@conf"]);
	} else {
		// application configuration
		queue.add("link('js', 'apps/" + appName + "/conf')", [], "conf");
		// application code
		queue.add("link('js', 'apps/" + appName + "/main')", ["plugins", "@conf"]);
	}
	
	queue.add("SW.prepare('" + appName + "')", ["plugins", "SW", "Inizia", "gui", "getSupportedProperty", "eventi", "menuHandler"]);
}

// given filetype and filename, returns id
//     @type    : string     : "js or "node"
//     @file    : string     : file path+name from data/
function libId(type, file)
{
	return "__" + type + "_" + file.replace("/", "_");
}

// remove a DOM element (cross browser, no exception if element not exist)
//     @id     : string     : node id
function removeFromDOM(id)
{
	var el = document.getElementById(id);
	if (el != null && typeof el != "undefined")
		el.parentNode.removeChild(el);
}

// include 1 js lib with <SCRIPT>
// or 1 CSS stylesheet with <LINK>
//     @type    : string     : "js" for JavaScript, "css" for StyleSheet
//     @file    : string     : file path + name starting from "data"
function link(type, file)
{
	// define tag
	if (type == "js") {
		var tag = document.createElement("script");
		tag.setAttribute("type",    "text/javascript");
		tag.setAttribute("src",     file + ".js");
	} else {
		var tag = document.createElement("link");
		tag.setAttribute("rel", "stylesheet");
		tag.setAttribute("type", "text/css");
		tag.setAttribute("href", file + ".css");
	}
	tag.setAttribute("id", libId(type, file));
	// insert into DOM
	document.getElementsByTagName("head")[0].appendChild(tag);
}

// removes <script> or <link> pointing to specified file
function unlink(type, file)
{
	var id = libId(type, file);
	removeFromDOM(id);
}

// object which contains options
//     @userOptions     : Object    : options specified by user / extension
//     @defaultOptions  : Object    : default values, only used for unspecified options
var opt = function(userOptions, defaultOptions)
{
	// accessor
	this.get = function(o)
	{
		return this.list[o];
	}
	
	// Constructor
	// set default values
	this.list = new Object();
	
	if (defaultOptions != null) {
		for (var o in defaultOptions) {
			this.list[o] = defaultOptions[o];
		}
	}
	// overwrite defaults
	for (var o in userOptions) {
		this.list[o] = userOptions[o];
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
function drop(arr, item)
{
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
function isArray(input)
{
	if (typeof input === 'undefined') return false;
	return input.constructor === Array;
}

// insert an item into Array and shift right next elements
//    @arr       : Array      : array
//    @item      : mixed      : new item for array
//    @position  : integer    : index for new item; null = last
function insert(arr, item, position)
{
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
function getById(arr, id)
{
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

alert(getById(arr, 10).id);

drop(arr, 20);

var abc = new Object;
abc.id = 100;

insert(arr, abc);


for (var i in arr) {
	alert("[" + i + "] = " + arr[i].id);
}
*/
