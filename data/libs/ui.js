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
	this.toBox = function()
	{
		if (this.type == "box" && typeof document.getElementById(id) != "undefined") {
			removeFromDOM(id);
		}
		this.type = "box";
		var tag = document.createElement("div");
		tag.setAttribute("id", id);
		if (id != "boxMain") tag.setAttribute("class", "boxAux");
		tag.style.height = this.size + "%";
		document.body.appendChild(tag);
		elmArea = document.getElementById(id);
		this.applyCSS();
		if (title) this.printBoxTitle();
	}
	
	// resize box or win
	this.resizeBox = function(height)
	{
		elmArea.style.height = String(height) + "%";
		this.size = height;
	}
	
	// create <h1> tag
	this.printBoxTitle = function()
	{
		var tag = document.createElement("h1");
		tag.setAttribute("class", "auxTitle");
		tag.innerHTML = title;
		elmArea.appendChild(tag);
	}
	
	// apply CSS props defined in arrStyles
	this.applyCSS = function()
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
	this.setCSSProperty = function(value, names)
	{
		if (!isArray(names)) names = [names];
		var i = arrStyles.length;
		arrStyles[i]           = new Object;
		arrStyles[i]["value"]  = value.replace("'", "\'");;
		arrStyles[i]["names"]  = names;
	}
	
	// sets specified html attribute. if value is null, remove attribute.
	this.setHTMLAttribute = function(name, value)
	{
		if (value == null || typeof value == "undefined")
			elmArea.removeAttribute(name);
		else
			elmArea.setAttribute(name, value);
	}
	
	// gets specified html attribute
	this.getHTMLAttribute = function(name)
	{
		if (typeof elmArea.getAttribute(name) == "undefined")
			return null;
		return elmArea.getAttribute(name);
	}
	
	
	/*
	 *    Output Methods
	 */
	
	// add text to the buffer
	this.write = function(text)
	{
		buffer += text;
	}
	
	// empty buffer
	this.empty = function()
	{
		buffer = "";
	}
	
	// clear element's content
	this.clear = function()
	{
		elmArea.innerHTML = "";
	}
	
	// replace old text with buffer and empty()
	this.send = function()
	{
		this.clear();
		this.printBoxTitle();
		elmArea.innerHTML += buffer;
		this.empty();
	}
	
	// append buffer to old text and empty()
	this.append = function()
	{
		elmArea.innerHTML += buffer;
		this.empty();
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
	this.type           = type;
	this.size           = size;
	var arrStyles       = [];
}


// user interface handler
var gui = new function ()
{
	/*
	 *    Methods
	 */
	
	// create new writeble area
	var createArea = function(id, type, title, before, size)
	{
		events.exec("GUICreateArea");
		
		// create elem
		var newArea = new area(id, type, title, size); // befor must not be passed
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
			removeFromDOM(arrArea[i].id);
		}
		// re-init vars
		arrArea   = [];
		first     = null;
		mainSize  = null;
	}
	
	// draw all boxes
	var draw = function()
	{
		events.exec("GUIDraw");
		
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
}


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

