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
	
	function addSection(id, title, tooltip, position)
	{
		var sec = new section(id, title, tooltip);
		insert(this.sections, sec, position);
		return this.sections[this.sections.length - 1];
	}
	
	function dropSection(id)
	{
		return drop(this.sections, id);
	}
	
	function getSection(id)
	{
		return getById(this.sections, id);
	}
	
	// if menu has been drawn, erase it
	function erase()
	{
		if (drawn) {
			for (var i in this.sections)
				this.sections[i].erase();
			this.sections = new Array;
			removeFromDOM(this.id);
		}
	}
	
	function draw()
	{
		var DOMMenu = document.createElement("div");
		DOMMenu.setAttribute("id", this.id);
		document.body.insertBefore(DOMMenu, document.body.firstChild);
		
		// draw all sections
		for (var i = 0; i < this.sections.length; i++) {
			this.sections[i].draw(DOMMenu);
		}
		
		drawn = true;
	}
	
	/*
	 *    Constructor
	 */
	
	var id        = idMenu;
	var sections  = [];
	var drawn     = false;
	
	// expose public props
	return {
		addSection   : addSection,
		dropSection  : dropSection,
		getSection   : getSection,
		erase        : erase,
		draw         : draw,
		id           : id,
		sections     : sections
	}
}


function section(id, title, tooltip)
{
	function addButton(id, event, position, text, desc, CSSClass)
	{
		var button = new ctrlButton(id, event, text, desc, CSSClass);
		insert(elements, button, position);
		return elements[elements.length - 1];
	}
	
//	this.addSelect = function(id, event, position, text, desc, arrOptions, intDefault)
//	{
//		
//	}
	
	function dropControl(id)
	{
		return drop(elements, id);
	}
	
	function erase()
	{
		// remove controls
		for (var i in elements)
			removeFromDOM(elements[i].id);
		elements = [];
		// remove section
		removeFromDOM(id);
	}
	
	function draw(DOMParent)
	{
		// section DIV
		// (workaround IE7 idiotic bug)
		DOMParent.innerHTML += '<div id="' + id + '" class="menuSectionBody"></div>';
		var sTag = document.getElementById(id);
		
		// title
		if (title) {
			var tTag = document.createElement("span");
			tTag.innerHTML = '<span class="menuSectionTitle" title="' + tooltip + '">' +
			                 title + "</span>";
			sTag.appendChild(tTag);
		}
		
		// controls
		for (var i in elements)
			elements[i].draw(sTag);
	}
	
	/*
	 *    Constructor
	 */
	
	var DOM       = {};
	var id        = id;
	var title     = title;
	var tooltip   = tooltip;
	var elements  = [];
	
	return {
		addButton    : addButton,
		dropControl  : dropControl,
		erase        : erase,
		draw         : draw,
		id           : id,
		elements     : elements
	}
}


function ctrlButton(id, event, text, desc, CSSClass)
{
	function draw(DOMParent)
	{
		var aTag = document.createElement("a");
		aTag.setAttribute("id", id);
		aTag.setAttribute("href", "javascript:" + event);
		if (desc != null)
			aTag.setAttribute("title", desc);
		if (CSSClass != null)
			aTag.setAttribute("class", CSSClass);
		aTag.innerHTML = text;
		DOMParent.appendChild(aTag);
	}
	
	/*
	 *    Constructor
	 */
	
	var id         = id;
	var event = (typeof event === "function") ? event.name + "()" : event = event;
	var text       = text;
	var desc       = desc;
	var CSSClass   = CSSClass;
	
	return {
		draw      : draw
	}
}

