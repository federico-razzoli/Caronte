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


"use strict";

// user interface handler
var gui = new function ()
{
	/*
	 *    Methods
	 */
	
	// create new writeble area
	this.createArea = function(id, type, title, before, size)
	{
		events.exec("GUICreateArea");
		
		// create elem
		var newArea = new area(id, type, title, size); // befor must not be passed
		if (before) {
			for (var i in this.arrArea) {
				this.arrArea[parseInt(i + 1)] = this.arrArea[i];
				first++;
			}
			this.arrArea[0] = newArea;
		} else
			this.arrArea[this.arrArea.length] = newArea;
		
		// if this elem is box, resize other elems
		if (type == "box" && first == null) {
			// remember 1st id (main box)
			first     = 0;
			this.mainSize  = 100;
		}
		return newArea;
	}
	
	// erase all boxes
	this.erase = function()
	{
		// remove from DOM
		for (var i in this.arrArea) {
			removeFromDOM(this.arrArea[i].id);
		}
		// re-init vars
		this.arrArea   = new Array;
		first     = null;
		this.mainSize  = null;
	}
	
	// draw all boxes
	this.draw = function()
	{
		events.exec("GUIDraw");
		
		// get all non-main boxes size
		var oldSize = 0;
		for (var i in this.arrArea) {
			if (this.arrArea[i].type == "box") {
				oldSize += this.arrArea[i].size;
			}
		}
		oldSize -= this.mainSize;
		
		// get new autosize for main box
		var newSize = this.mainSize - oldSize;
		
		// draw all boxes
		for (var i in this.arrArea) {
			if (this.arrArea[i].type == "box") {
				this.arrArea[i].toBox();
			}
		}
		
		// resize main box
		this.arrArea[first].resizeBox(newSize);
	}
	
	/*
	 *    Members
	 */
	
	this.arrArea   = new Array;    // all document's area objects
	var first     = null;         // id of first area (will be resized when creating more elems)
	this.mainSize  = null;
}

// box or window object
//    @id            : string     : HTML id attr
//    @title         : string     : title to print
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
		if (this.type == "box" && typeof document.getElementById(this.id) != "undefined") {
			removeFromDOM(this.id);
		}
		this.type = "box";
		var tag = document.createElement("div");
		tag.setAttribute("id", this.id);
		if (this.id != "boxMain") tag.setAttribute("class", "boxAux");
		tag.style.height = this.size + "%";
		document.body.appendChild(tag);
		this.elmArea = document.getElementById(this.id);
		this.applyCSS();
		if (this.title) this.printBoxTitle();
	}
	
	// resize box or win
	this.resizeBox = function(height)
	{
		this.elmArea.style.height = String(height) + "%";
		this.size = height;
	}
	
	// create <h1> tag
	this.printBoxTitle = function()
	{
		var tag = document.createElement("h1");
		tag.innerHTML = this.title;
		this.elmArea.appendChild(tag);
	}
	
	// apply CSS props defined in arrStyles
	this.applyCSS = function()
	{
		for (var i = 0; i < arrStyles.length; i++) {
			var prop = getSupportedProperty(this.elmArea, arrStyles[i]["names"]);
			if (!prop) return false;
			this.elmArea.style[prop] = arrStyles[i]["value"];
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
	
	// get 1st defined CSS class or null
	this.getCSSProperty = function()
	{
		var stmt = "";
		var pValue;
		for (i = 0; i < arguments.length; i++) {
			pValue = this.elmArea.style[arguments[i]];
			if (typeof pValue == "string" && pValue != "")
				return pValue;
		}
		return false;
	}
	
	// sets specified html attribute. if value is null, remove attribute.
	this.setHTMLAttribute = function(name, value)
	{
		if (value == null || typeof value == "undefined")
			this.elmArea.removeAttribute(name);
		else
			this.elmArea.setAttribute(name, value);
	}
	
	// gets specified html attribute
	this.getHTMLAttribute = function(name)
	{
		if (typeof this.elmArea.getAttribute(name) == "undefined")
			return null;
		return this.elmArea.getAttribute(name);
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
		this.elmArea.innerHTML = "";
	}
	
	// replace old text with buffer and empty()
	this.send = function()
	{
		this.clear();
		this.printBoxTitle();
		this.elmArea.innerHTML += buffer;
		this.empty();
	}
	
	// append buffer to old text and empty()
	this.append = function()
	{
		this.elmArea.innerHTML += buffer;
		this.empty();
	}
	
	/*
	 *    Constructor
	 */
	
	// default values (for main area)
	if (size == null)    size    = 100;
	if (title == null)   title   = "";
	
	// set members
	var buffer         = "";
	this.elmArea        = new Object;
	this.id             = id;
	this.type           = type;
	this.title          = title;
	this.size           = size;
	var arrStyles      = new Array;
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
