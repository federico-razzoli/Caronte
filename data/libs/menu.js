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


/*global UTILE: false */

"use strict";

UTILE.menuHandler = function(idMenu) {
	// private members
	var id        = idMenu,
		sections  = [],
		drawn     = false;
	
	/*
	 *    Methods
	 */
	
	function addSection(id, title, tooltip, position) {
		var sec = new UTILE.section(id, title, tooltip);
		UTILE.insert(this.sections, sec, position);
		return this.sections[this.sections.length - 1];
	}
	
	function dropSection(id) {
		return UTILE.drop(this.sections, id);
	}
	
	function getSection(id) {
		return UTILE.getById(this.sections, id);
	}
	
	// if menu has been drawn, erase it
	function erase() {
		var i;
		if (drawn) {
			for (i in this.sections) {
				this.sections[i].erase();
			}
			this.sections = [];
			UTILE.removeFromDOM(this.id);
		}
	}
	
	function draw() {
		var DOMMenu = document.createElement("div"),
			i;
		DOMMenu.setAttribute("id", this.id);
		document.body.insertBefore(DOMMenu, document.body.firstChild);
		//document.body.appendChild(DOMMenu, document.body.firstChild);
		
		// draw all sections
		for (i = 0; i < this.sections.length; i++) {
			this.sections[i].draw(DOMMenu);
		}
		
		drawn = true;
	}
	
	// expose public props
	return {
		addSection   : addSection,
		dropSection  : dropSection,
		getSection   : getSection,
		erase        : erase,
		draw         : draw,
		id           : id,
		sections     : sections
	};
}


UTILE.section = function(id, title, tooltip) {
	// private members
	var DOM       = {};
	var id        = id;
	var title     = title;
	var tooltip   = tooltip;
	var elements  = [];
	
	function addButton(position, id, event, text, desc, CSSClass) {
		var button = new UTILE.ctrlButton(id, event, text, desc, CSSClass);
		UTILE.insert(elements, button, position);
		return elements[elements.length - 1];
	}
	
	function addSelect(position, id, items, globalEvent, text, CSSClass) {
		var ctrl = new UTILE.ctrlSelect(id, items, globalEvent, text, CSSClass);
		UTILE.insert(elements, ctrl, position);
		return elements[elements.length - 1];
	}
	
	function dropControl(id) {
		return UTILE.drop(elements, id);
	}
	
	function erase() {
		// remove controls
		for (var i in elements)
			UTILE.removeFromDOM(elements[i].id);
		elements = [];
		// remove section
		UTILE.removeFromDOM(id);
	}
	
	function draw(DOMParent) {
		// section DIV
		// (workaround IE7 idiotic bug)
		DOMParent.innerHTML += '<div id="' + id + '" class="menuSectionBody"></div>';
		var sTag = document.getElementById(id);
		
		// title
		if (title) {
			var tTag = '<span class="menuSectionTitle" title="';
			tTag += tooltip;
			tTag += '">';
			tTag += title;
			tTag += "</span>\n";
			sTag.innerHTML += tTag;
		}
		
		// controls
		for (var i in elements) {
			elements[i].draw(sTag);
		}
	}
	
	// expose public members
	return {
		addButton    : addButton,
		addSelect    : addSelect,
		dropControl  : dropControl,
		erase        : erase,
		draw         : draw,
		id           : id,
		elements     : elements
	};
}


UTILE.ctrlButton = function(id, event, text, desc, CSSClass) {
	function draw(DOMParent) {
		// <a id="" href="">
		var aTag = '<a id="';
		aTag += id;
		aTag += '" href="javascript:';
		aTag += event;
		aTag += '"';
		
		// title attribute
		if (desc) {
			aTag += ' title="';
			aTag += desc;
			aTag += '"';
		}
		
		// class attribute
		if (CSSClass) {
			aTag += ' class="';
			aTag += CSSClass;
			aTag += '"';
		} else {
			aTag += ' class="ctrlButton"';
		}
		
		// tag value and close
		aTag += ">";
		aTag += text;
		aTag += "</a>\n"
		DOMParent.innerHTML += aTag;
	}
	
	/*
	 *    Constructor
	 */
	
	event = (typeof event === "function") ? event.name + "()" : event;
	
	return {
		draw      : draw
	};
}

// This Control is a <select>
// id           : string       : DOM id
// items        : array        : array of objects: "label", "value", "tooltip", "isDefault"
// globalEvent  : string/func  : <select onchange="">
// text         : string       : shown before the Control
// CSSClass     : string       : CSS class
// In most cases, you will need to set a globalInput - a function that will be called
// when any value gets selected. item's ["value"] will be passed to that function.
UTILE.ctrlSelect = function(id, items, globalEvent, text, CSSClass) {
	function draw(DOMParent) {
		var out,
			pClass,
			pEvent,
			key,             // item's id
			option,
			optValue,
			optTitle,
			optIsDefault;
		// start <select>
		out = "";
		if (text) {
			out = '<label class="ctrlLabel">' + text + "<br>\n";
		}
		pClass  = CSSClass ? ' class="' + CSSClass + '"' : "";
		pEvent  = ' onchange="' + globalEvent + '(this.options[this.selectedIndex].value)"';
		out    += '<select id="' + id + '"' + pClass + pEvent + '>\n';
		
		// <option>'s
		for (key in items) {
			option = items[key];
			
			optValue  = ' value="' + key + '"';
			if (option.isDefault) {
				optIsDefault  = ' selected="selected"';
			} else {
				optIsDefault  = "";
			}
			
			out += '<option' + optValue + optIsDefault + '>' + 
			       option.label + '</option>\n';
		}
		
		// end tag
		out += "</select>\n";
		if (text) {
			out += "</label>";
		}
		
		// show HTML
		DOMParent.innerHTML += out;
	}
	
	/*
	 *    Constructor
	 */
	
	return {
		draw      : draw
	};
}

