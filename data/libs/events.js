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
	event:
	Event type. It occures at some point of the code, inside Caronte or
	inside the extension that defines it.
	
	hooks:
	All hooks associated to an event.
	Every hook is a function. When an event occures, all its hooked functions
	are executed.
	
	#REQUIRES: none
*/


"use strict";

UTILE.hooks = function() {
	// add a hook
	//     @hookId      : String    : hook id
	//     @func        : function  : function that will be executed
	function add(hookId, obj, func)
	{
		list[hookId]       = {};
		list[hookId].obj   = obj;
		list[hookId].func  = func;
	}
	
	// exec hooked funcs
	function exec(args)
	{
		for (var hook in list) {
			var obj   = list[hook].obj;
			var func  = list[hook].func;
			if (typeof args === "undefined") // IE7 bug
				func.apply(obj);
			else
				func.apply(obj, args);
		}
	}
	
	// drop a hook
	//     @hookId      : String    : hook id
	function drop(hookId)
	{
		delete list[hookId];
	}
	
	var list = {};
	
	return {
		add     : add,
		exec    : exec,
		drop    : drop
	};
}


UTILE.events = function ()
{
	// define an event and associate existing handlers
	//     @eventId      : String   : event unique id
	//     @force        : Bool     : if already defined, re-define
	function define(eventId, force)
	{
		// check for error but dont stop execution
		if ((typeof list[eventId] != "undefined") && !force) {
			UTILE.issue("Event " + eventId + " was already defined\n" +
				"(caller: " + arguments.callee.caller.name + ")");
		}
		
		list[eventId] = UTILE.hooks();
		var handlerName = "on" + eventId;
		
		// low-level events which are defined before plugins
		// will not be filled this way
		// (extensions developers should know this)
		if (typeof plugins != "undefined") {
			var pluginList = plugins.get();
			for (var o in pluginList) {
				if (typeof pluginList[o][handlerName] != "undefined") {
					var hookId = o + "." + handlerName;
					list[eventId].add(hookId, pluginList[o], pluginList[o][handlerName]);
				}
			}
		}
		
		// check for global function
		if (typeof window[handlerName] != "undefined") {
			var hookId = "window." + handlerName;
			list[eventId].add(hookId, window, window[handlerName]);
		}
	}
	
	// return true if event is defined, else false
	//     @eventId      : String   : event unique id
	function isDefined(eventId)
	{
		return (typeof list[eventId] != "undefined");
	}
	
	// execute all hooks in an event
	//     @eventId      : String   : event id
	function exec(eventId, args)
	{
		// is eventId defined?
		if (typeof list[eventId] === "undefined") {
			UTILE.issue("Event " + eventId + " was not defined");
			return false;
		}
		
		// exec all hooks
		list[eventId].exec(args);
	}
	
	// delete an event and all its hooks
	//     @eventId      : String   : event id
	function undefine(eventId)
	{
		delete list[eventId];
	}
	
	var list = {};
	
	return {
		define     : define,
		isDefined  : isDefined,
		exec       : exec,
		undefined  : undefined
	}
}();

