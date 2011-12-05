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
	event:
	Event type. It occures at some point of the code, inside Idra or
	inside the extension that defines it.
	
	hooks:
	All hooks associated to an event.
	Every hook is a function. When an event occures, all its hooked functions
	are executed.
	
	#REQUIRES: none
*/


"use strict";

function hooks()
{
	// add a hook
	//     @hookId      : String    : hook id
	//     @func        : function  : function that will be executed
	this.add = function(hookId, obj, func)
	{
		this.list[hookId]       = new Object;
		this.list[hookId].obj   = obj;
		this.list[hookId].func  = func;
	}
	
	// exec hooked funcs
	this.exec = function(args)
	{
		for (var hook in this.list) {
			var obj   = this.list[hook].obj;
			var func  = this.list[hook].func;
			if (typeof args === "undefined") // IE7 bug
				func.apply(obj);
			else
				func.apply(obj, args);
		}
	}
	
	// drop a hook
	//     @hookId      : String    : hook id
	this.drop = function(hookId)
	{
		delete this.list[hookId];
	}
	
	this.list = new Object;
}

var events = new function()
{
	// define an event and associate existing handlers
	//     @eventId      : String   : event unique id
	//     @force        : Bool     : if already defined, re-define
	this.define = function(eventId, force)
	{
		// check for error but dont stop execution
		if ((typeof this.list[eventId] != "undefined") && !force) {
			issue("Event " + eventId + " was already defined\n" +
				"(caller: " + arguments.callee.caller.name + ")");
		}
		
		this.list[eventId] = new hooks();
		var handlerName = "on" + eventId;
		
		// low-level events which are defined before plugins
		// will not be filled this way
		// (extensions developers should know this)
		if (typeof plugins != "undefined") {
			var pluginList = plugins.get();
			for (var o in pluginList) {
				if (typeof pluginList[o][handlerName] != "undefined") {
					var hookId = o + "." + handlerName;
					this.list[eventId].add(hookId, pluginList[o], pluginList[o][handlerName]);
				}
			}
		}
		
		// check for global function
		if (typeof window[handlerName] != "undefined") {
			var hookId = "window." + handlerName;
			this.list[eventId].add(hookId, window, window[handlerName]);
		}
	}
	
	// return true if event is defined, else false
	//     @eventId      : String   : event unique id
	this.isDefined = function(eventId)
	{
		return (typeof this.list[eventId] != "undefined");
	}
	
	// execute all hooks in an event
	//     @eventId      : String   : event id
	this.exec = function(eventId, args)
	{
		// is eventId defined?
		if (typeof this.list[eventId] === "undefined") {
			issue("Event " + eventId + " was not defined");
			return false;
		}
		
		// exec all hooks
		this.list[eventId].exec(args);
	}
	
	// delete an event and all its hooks
	//     @eventId      : String   : event id
	this.undefine = function(eventId)
	{
		delete this.list[eventId];
	}
	
	// alert dbug info
	this.debug = function()
	{
		for (var e in this.list) {
			alert(e); // event id
			for (var h in this.list[e].list) {
				var hook = this.list[e].list[h];
				alert("Hook: " + h + "\n" +
				      "obj: " + hook["obj"] + "\n" +
					  hook["func"]);
			}
		}
	}
	
	this.list = new Object;
}
