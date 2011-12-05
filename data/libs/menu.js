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

// Plugin developers only need:
//   * menu.addSection()
//   * menu.dropSection()
//   * menu.draw()
//   * menu.getSection().addButton()
//   * menu.getSection().dropControl()


"use strict";

function menuHandler(idMenu)
{
	/*
	 *    Methods
	 */
	
	this.addSection = function(id, title, tooltip, position)
	{
		var sec = new section(id, title, tooltip);
		insert(this.sections, sec, position);
		return this.sections[this.sections.length - 1];
	}
	
	this.dropSection = function(id)
	{
		return drop(this.sections, id);
	}
	
	this.getSection = function(id)
	{
		return getById(this.sections, id);
	}
	
	// if menu has been drawn, erase it
	this.erase = function()
	{
		if (this.drawn) {
			for (var i in this.sections)
				this.sections[i].erase();
			this.sections = new Array;
			removeFromDOM(this.id);
		}
	}
	
	this.draw = function()
	{
		var DOMMenu = document.createElement("div");
		DOMMenu.setAttribute("id", this.id);
		document.body.insertBefore(DOMMenu, document.body.firstChild);
		
		// draw all sections
		for (var i = 0; i < this.sections.length; i++) {
			this.sections[i].draw(DOMMenu);
		}
		
		this.drawn = true;
	}
	
	/*
	 *    Constructor
	 */
	
	this.id        = idMenu;
	this.sections  = new Array;
	this.drawn     = false;
}


function section(id, title, tooltip)
{
	this.addButton = function(id, event, position, text, desc, CSSClass)
	{
		var button = new ctrlButton(id, event, text, desc, CSSClass);
		insert(this.elements, button, position);
		return this.elements[this.elements.length - 1];
	}
	
//	this.addSelect = function(id, event, position, text, desc, arrOptions, intDefault)
//	{
//		
//	}
	
	this.dropControl = function(id)
	{
		return drop(this.elements, id);
	}
	
	this.erase = function()
	{
		// remove controls
		for (var i in this.elements)
			removeFromDOM(this.elements[i].id);
		this.elements = new Array;
		// remove section
		removeFromDOM(this.id);
	}
	
	this.draw = function(DOMParent)
	{
		// section DIV
		var sTag = document.createElement("div");
		sTag.setAttribute("id", this.id);
		sTag.setAttribute("class", "menuSectionBody");
		DOMParent.appendChild(sTag);
		
		// title
		if (this.title) {
			var tTag = document.createElement("span");
			tTag.innerHTML = '<span class="menuSectionTitle" title="' + this.tooltip + '">' +
			                 this.title + "</span>";
			sTag.appendChild(tTag);
		}
		
		// controls
		for (var i in this.elements)
			this.elements[i].draw(sTag);
	}
	
	/*
	 *    Constructor
	 */
	
	this.DOM       = new Object();
	this.id        = id;
	this.title     = title;
	this.tooltip   = tooltip;
	this.elements  = new Array;
}


function ctrlButton(id, event, text, desc, CSSClass)
{
	this.draw = function(DOMParent)
	{
		var aTag = document.createElement("a");
		aTag.setAttribute("id", this.id);
		aTag.setAttribute("href", "javascript:" + this.event);
		if (this.desc != null)
			aTag.setAttribute("title", this.desc);
		if (this.CSSClass != null)
			aTag.setAttribute("class", this.CSSClass);
		aTag.innerHTML = text;
		DOMParent.appendChild(aTag);
	}
	
	/*
	 *    Constructor
	 */
	
	this.id         = id;
	event = (typeof event == "function") ? event.name + "()" : this.event = event;
	this.event      = event;
	this.text       = text;
	this.desc       = desc;
	this.CSSClass   = CSSClass;
}

function ctrlSwitch(id, event, textOn, textOff, initialState, desc, CSSClass)
{
	this.draw = function(DOMParent)
	{
		aTag = document.createElement("a");
		aTag.setAttribute("id", this.id);
		aTag.setAttribute("href", "javascript:" + this.event);
		if (this.desc != null)
			aTag.setAttribute("title", this.desc);
		if (this.CSSClass != null)
			aTag.setAttribute("class", this.CSSClass);
		aTag.innerHTML = text;
		DOMParent.appendChild(aTag);
	}
	
	/*
	 *    Constructor
	 */
	
	this.id         = id;
	event = (typeof event == "function") ? event.name + "()" : this.event = event;
	this.event      = event;
	this.text       = text;
	this.desc       = desc;
	this.CSSClass   = CSSClass;
}
