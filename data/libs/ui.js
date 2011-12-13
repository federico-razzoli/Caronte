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


"use strict";

// box or window object
//    @id            : string     : HTML id attr
//    @type          : string     : default element type: "box" || "win" || "hid"
//    @title         : string     : title will be printed
//    @size          : int        : used to size elem and redize other elems
function area(id, type, title, size)
{
	/*
	 *    Element Methods
	 */
	
	// append buffer to old text and empty()
	function toBox()
	{
		if (type == "box" && typeof document.getElementById(id) != "undefined") {
			UTILE.removeFromDOM(id);
		}
		type = "box";
		var tag = document.createElement("div");
		tag.setAttribute("id", id);
		if (id != "boxMain") tag.setAttribute("class", "boxAux");
		tag.style.height = size + "%";
		document.body.appendChild(tag);
		elmArea = document.getElementById(id);
		applyCSS();
		if (title) printBoxTitle();
	}
	
	// resize box or win
	function resizeBox(height)
	{
		elmArea.style.height = String(height) + "%";
		size = height;
	}
	
	// create <h1> tag
	function printBoxTitle()
	{
		var tag = document.createElement("h1");
		tag.setAttribute("class", "auxTitle");
		tag.innerHTML = title;
		elmArea.appendChild(tag);
	}
	
	// apply CSS props defined in arrStyles
	function applyCSS()
	{
		for (var i = 0; i < arrStyles.length; i++) {
			var prop = getSupportedProperty(elmArea, arrStyles[i]["names"]);
			if (!prop) return false;
			elmArea.style[prop] = arrStyles[i]["value"];
		}
	}
	
	// sets 1st supported CSS property
	// first argument is value, latter is an array of property names.
	// properties names must be specified in javascript style: text-align => textAlign.
	// if a property has been set returns true, else false
	function setCSSProperty(value, names)
	{
		if (!UTILE.isArray(names)) names = [names];
		var i = arrStyles.length;
		arrStyles[i]           = {};
		arrStyles[i]["value"]  = value.replace("'", "\'");;
		arrStyles[i]["names"]  = names;
	}
	
	// set specified html attribute. if value is null, remove attribute.
	function setHTMLAttribute(name, value)
	{
		if (value == null || typeof value == "undefined")
			elmArea.removeAttribute(name);
		else
			elmArea.setAttribute(name, value);
	}
	
	// get specified html attribute
	function getHTMLAttribute(name)
	{
		if (typeof elmArea.getAttribute(name) == "undefined")
			return null;
		return elmArea.getAttribute(name);
	}
	
	
	/*
	 *    Output Methods
	 */
	
	// add text to the buffer
	function write(text)
	{
		buffer += text;
	}
	
	// empty buffer
	function empty()
	{
		buffer = "";
	}
	
	// clear element's content
	function clear()
	{
		elmArea.innerHTML = "";
	}
	
	// replace old text with buffer and empty()
	function send()
	{
		clear();
		printBoxTitle();
		elmArea.innerHTML += buffer;
		empty();
	}
	
	// append buffer to old text and empty()
	function append()
	{
		elmArea.innerHTML += buffer;
		empty();
	}
	
	/*
	 *    Constructor
	 */
	
	// default values (for main area)
	if (size == null)    size    = 100;
	if (title == null)   title   = "";
	
	// set members
	var buffer          = "";
	var elmArea         = {};
	var type            = type;
	var size            = size;
	var arrStyles       = [];
	
	// public
	return {
		// area methods
		toBox             : toBox,
		resizeBox         : resizeBox,
		setCSSProperty    : setCSSProperty,
		getHTMLAttribute  : getHTMLAttribute,
		setHTMLAttribute  : getHTMLAttribute,
		
		// output methods
		write             : write,
		empty             : empty,
		clear             : clear,
		send              : send,
		append            : append,
		
		// props
		type              : type,
		size              : size
	}
}


// user interface handler
var gui = function ()
{
	/*
	 *    Methods
	 */
	
	// create new writeble area
	var createArea = function(id, type, title, before, size)
	{
		UTILE.events.exec("GUICreateArea");
		
		// create elem
		var newArea = area(id, type, title, size); // befor must not be passed
		if (before) {
			for (var i in arrArea) {
				arrArea[parseInt(i + 1)] = arrArea[i];
				first++;
			}
			arrArea[0] = newArea;
		} else
			arrArea[arrArea.length] = newArea;
		
		// if this elem is box, resize other elems
		if (type == "box" && first == null) {
			// remember 1st id (main box)
			first     = 0;
			mainSize  = 100;
		}
		return newArea;
	}
	
	// erase all boxes
	var erase = function()
	{
		// remove from DOM
		for (var i in arrArea) {
			UTILE.removeFromDOM(arrArea[i].id);
		}
		// re-init vars
		arrArea   = [];
		first     = null;
		mainSize  = null;
	}
	
	// draw all boxes
	var draw = function()
	{
		UTILE.events.exec("GUIDraw");
		
		// get all non-main boxes size
		var oldSize = 0;
		for (var i in arrArea) {
			if (arrArea[i].type == "box") {
				oldSize += arrArea[i].size;
			}
		}
		oldSize -= mainSize;
		
		// get new autosize for main box
		var newSize = mainSize - oldSize;
		
		// draw all boxes
		for (var i in arrArea) {
			if (arrArea[i].type == "box") {
				arrArea[i].toBox();
			}
		}
		
		// resize main box
		arrArea[first].resizeBox(newSize);
	}
	
	/*
	 *    Constructor
	 */
	
	// private members
	var arrArea    = [];           // all document's area objects
	var first      = null;         // id of main area (will be resized when creating more elems)
	var mainSize   = null;         // size of main area
	
	// public methods
	return {
		createArea  : createArea,
		erase       : erase,
		draw        : draw
	}
}();


// return 1st CSS property supported by specified element (with current useragent)
//    @elem      : DOM Object      : Element wich supports property
//    @arrProps  : array[string]   : Array of possible properties.
//                                   Properties names must be specified in 
//                                   javascript style: text-align => textAlign
//    RETURN     : String or Bool  : supported prop or false
function getSupportedProperty(elem, arrProps)
{
	for (var i = 0; i < arrProps.length; i++) { //loop through possible properties
		if (typeof elem.style[arrProps[i]] == "string") { // not undefined
			return arrProps[i];
		}
	}
	return false;
}

