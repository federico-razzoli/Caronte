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
	USAGE
	
	Set a simple localized message:
	locale.set("stupid", "Error: you are too stupid to use this software!");
	
	Get a simple message:
	locale.get("stupid");
	
	Set a message with parameters:
	locale.set("stupid", "Error: you are too stupid to %1 and %2!");
	
	Get a message passing parameters:
	locale.getp("stupid", "climb a wall", "survive");
	
	Writing the "%" character:
	locale.set("100%%");
	locale.set("You can write it twice: %%%");
	
	NOTES
	
	locale.getp() can be used in place of get(), but get() is a little faster.
*/


"use strict";

var locale = function() {
	var arrMsg = [];
	
	// add / replace translated string
	//    id    : string    : message key
	//    txt   : string    : message text
	function set(id, txt) {
		arrMsg[id] = txt;
	}
	
	// get string, without parameters
	function get(id) {
		return (typeof arrMsg[id] === "undefined" ? id : arrMsg[id]);
	}
	
	// get string, optionally with parameters
	// first param is message id, later params (if any) are message params
	// if message id does not exist, return boolean false
	function getp(msgId) {
		var msg = arrMsg[msgId],
			i;
		if (typeof msg === "undefined") { // missing
			return false;
		}
		if (arguments.length > 0) {
			msg = msg.replace("%%", "&#37;");
			for (i = 1; i < arguments.length; i++) {
				msg = msg.replace("%" + i, arguments[i]);
			}
		}
		return msg;
	}
	
	// return if specified message id exists
	function isSet(id) {
		return (typeof arrMsg[id] !== "undefined");
	}
	
	// public methods
	return {
		set    : set,
		get    : get,
		getp   : getp,
		isSet  : isSet
	};
}();

