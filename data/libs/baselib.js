/*
 *    Base Lib
 *
 *    These functions are used by all classes.
 *    Some of them are needed by the HTML to include other JavaScript files.
 */


window.onerror = function(err, url, line, stop)
 {
	var                out  =        "Error: "  + err;
	if (url)           out += "\n" + "URL: "    + url;
	if (line != null)  out += "\n" + "Line: "   + line;
	alert(out);
}

// wait all passed objects are loaded, then execute func
var queue = new function()
{
	// adds new item to queue
	this.add = function(func, objects)
	{
		this.list.push([func, objects]);
		if (this.list.length == 1) this.tryToExec();
	}
	
	// exec next item
	this.tryToExec = function()
	{
		if (this.lock) return false;
		this.lock = true;
		
		//for (var o in this.list) alert(o + " " + this.list[o]);
		
		// repeat loop on items until an item exist or a loop was useless
		while (true) {
			var itemLazy;              // current item is lazy?
			var itemExecuted = false;  // at least 1 item ecexuted?
			
			// loop on items
			for (var x in this.list) {
				// get item
				var item     = this.list[x];
				var func     = item[0];
				var objects  = item[1];
				if (!isArray(objects)) objects = [];
				
				// this item is lazy? (loop on objects)
				itemLazy = false;
				for (var y in objects) {
					// check item
					if (eval("typeof " + objects[y] + " == 'undefined';"))
						itemLazy = true;
					else if (eval(objects[y])  === false)
						itemLazy = true;
					if (itemLazy) break;
					//else alert("lazy " + objects[y]);
				}
				
				if (!itemLazy) {
					// item is ready! exec & drop it
					eval(func);
					this.list.splice(x, 1);
					itemExecuted = true;
				}
			}
			// nothin more to do or nothin done
			if (this.list.length == 0 || !itemExecuted) break;
		}
		this.lock = false;
		if (this.list.length > 0) this.defer();
	}
	
	// set new timeout
	this.defer = function()
	{
		window.setTimeout(function(queue){queue.tryToExec()}, this.millisec, queue);
	}
	
	// constructor
	this.millisec  = 50;
	this.list      = new Array();
	this.lock      = false;  // prevents conflicts
}

// includes js libs and calls adventure
function init()
{
	var arrScripts = Array(
			"ui",             // output system
			"menu",           // menu handler
			"tinybox",        // modal window
			"idra",           // game system
			"plugin_loader"   // load/unload extensions
		);
	for (var i in arrScripts) {
		link("js", "libs/" + arrScripts[i]);
	}
	link("css", "themes/default/main");
	
	//queue.add("link('js', 'plugin_loader')",  ["extensions", "gui", "getSupportedProperty", "menuHandler"]);
	
	var appName;
	if (document.URL.indexOf("?") > 0) {
		appName = document.URL.substring(document.URL.indexOf("?") + 1);
	} else {
		appName = "gioco";
	}
	link("js", appName);
	
	queue.add("plugins.loadAll()",  ["idra", "Inizia", "extensions", "gui", "getSupportedProperty", "eventi", "menuHandler"]);
	queue.add("gioca()",            ["Inizia", "gioca", "plugins.ready"]);
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
	var loaded = false;
	if (type == "js") {
		tag        = document.createElement("script");
		tag.setAttribute("type",    "text/javascript");
		tag.setAttribute("src",     "data/" + file + ".js");
		//tag.setAttribute("onload",  "loaded = 1");
	} else {
		tag        = document.createElement("link");
		tag.setAttribute("rel", "stylesheet");
		tag.setAttribute("type", "text/css");
		tag.setAttribute("href", "data/" + file + ".css");
	}
	tag.setAttribute("id", libId(type, file));
	document.getElementsByTagName("head")[0].appendChild(tag);
}

// removes <script> or <link> pointing to specified file
function unlink(type, file)
{
	id = libId(type, file);
	removeFromDOM(id);
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
	if (typeof input == 'undefined') return false;
	return input.constructor == Array;
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
