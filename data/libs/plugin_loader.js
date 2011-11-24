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

var plugins = new function()
{
	// link & load all extensions
	this.loadAll = function()
	{
		this.plugins = new Object;
		for (var name in extensions) {
			// link js file
			var fileName = "data/ext/" + name.substr(3).toLowerCase();
			link("js", fileName);
			
			// extensions items could be an object of options
			var params = (typeof window.extensions[name] != "undefined") ? extensions[name] : new Object;
			
			// load single extension when link operation is done
			queue.add("plugins.add('" + name + "', new " + name + "());", [name]);
			this.toLoad++;
		}
		if (this.toLoad == 0) this.ready = true;
	}
	
	// adds plugin to the array and checks if initial loading is finished
	//     name     : String    : plugin name
	//     obj      : Object    : instance of plugin
	this.add = function(name, obj)
	{
		// add instance to plugins
		this.plugins[name] = obj;
		
		// options
		if (typeof this.plugins[name].defaultOptions != "undefined")
			var defaults = this.plugins[name].defaultOptions;
		else
			var defaults = null;
		this.plugins[name].options = new opt(extensions[name], defaults);
		
		// now options are set; load plugin
		obj.load();
		events.exec("PluginLoaded");
		
		// plugins object is ready?
		this.toLoad--;
		if (this.toLoad == 0) {
			// all ext loaded
			this.ready = true;
			
			// define standard events
			defineEvents();
			events.exec("PluginsReady");
		}
	}
	
	// free memory if the plugin is not needed
	this.unload = function(name)
	{
		unlink("js", "ext/" + name);
		if (typeof this.plugins[name].unload != "undefined")
			this.plugins[name].unload();
		delete this.plugins[name];
	}
	
	// return true if loaded, else false
	this.isLoaded = function(name)
	{
		return (this.plugins[name] != null) ? true : false;
	}
	
	// if name is specified, return matching plugin; 
	// else return an array of plugin objects
	this.get = function(name)
	{
		return name = name ? this.plugins[name] : this.plugins;
	}
	
	this.plugins   = new Array();
	this.toLoad    = 0;
	this.ready     = false;
}
