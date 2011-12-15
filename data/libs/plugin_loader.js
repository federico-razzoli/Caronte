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

var plugins = function() {
	// public props
	var objExtensions   = {},
		ready           = false,
	
	// private props
		toLoad          = 0,  // number of files to load: when 0 we're ready
		loadedFiles     = {}; // log of loaded files (won't be reloaded)
	loadedFiles.dict    = {};
	loadedFiles.locale  = {};
	
	// link & load all extensions
	function loadAll () {
		var name,
			fileName,
			params;
		
		objExtensions = {};
		for (name in extensions) {
			// link js file
			fileName = "data/ext/" + name.substr(3).toLowerCase() + "/main";
			UTILE.link("js", fileName);
			
			// extensions items could be an object of options
			params = (typeof window.extensions[name] !== "undefined") ? extensions[name] : {};
			
			// load single extension when link operation is done
			queue.add("plugins.add('" + name + "', UTILE.funcExts['" + name + "']);", ["UTILE.funcExts['" + name + "']"]);
			toLoad++;
		}
		
		if (toLoad === 0) {
			this.ready = true;
			UTILE.defineEvents();
			UTILE.events.exec("PluginsReady");
		}
	}
	
	// adds plugin to the array and checks if initial loading is finished
	//     name     : String    : plugin name
	//     obj      : Object    : instance of plugin
	function add (name, obj) {
		var defaults,
			lang;
		
		// options
		if (typeof obj.defaultOptions !== "undefined") {
			defaults = obj.defaultOptions;
		} else {
			defaults = null;
		}
		obj.options = UTILE.opt(extensions[name], defaults);
		
		// now options are set; load plugin
		obj.load();
		UTILE.events.exec("PluginLoaded");
		
		// plugin-specific dictionary/locale file to load?
		if (typeof obj.dictionary !== "undefined" && typeof loadedFiles["dict"][name] !== "undefined") {
			toLoad++;
			loadedFiles["dict"][name] = true;
			queue.add("UTILE.link('js', 'data/ext/" + name.substr(3).toLowerCase() + "/dict/" + SW.options.get("defaultDictionary") + "');");
		}
		if (typeof obj.locale !== "undefined" && typeof loadedFiles["locale"][name] !== "undefined") {
			if (SW.options.get("lang")) {
				lang = SW.options.get("lang");
			} else if (SW.options.get("defaultLocale")) {
				lang = SW.options.get("defaultLocale");
			} else {
				lang = obj.locale[0];
			}
			toLoad++;
			loadedFiles["locale"][name] = true;
			queue.add("UTILE.link('js', 'data/ext/" + name.substr(3).toLowerCase() + "/locale/" + lang + "');");
		}
		
		// add instance to plugins
		objExtensions[name]  = obj;
		this.fileLoaded();
	}
	
	// if plugins are ready, update flag and events
	function fileLoaded() {
		toLoad--;
		if (toLoad === 0) {
			// all ext loaded
			this.ready = true;
			
			// define standard events
			UTILE.defineEvents();
			UTILE.events.exec("PluginsReady");
		}
	}
	
	// free memory if the plugin is not needed
	function unload(name) {
		UTILE.unlink("js", "ext/" + name);
		if (typeof objExtensions[name].unload !== "undefined") {
			objExtensions[name].unload();
		}
		delete objExtensions[name];
	}
	
	// return true if loaded, else false
	function isLoaded(name) {
		return (typeof objExtensions[name] === "undefined") ? false : true;
	}
	
	// if name is specified, return matching plugin; 
	// else return an array of plugin objects
	function get(name) {
		if (name && typeof objExtensions[name] === "undefined") {
			UTILE.issue(locale.getp("pluginUndefined", name));
			return false;
		}
		return name = name ? objExtensions[name] : objExtensions;
	}
	
	return {
		loadAll      : loadAll,
		add          : add,
		fileLoaded   : fileLoaded,
		unload       : unload,
		isLoaded     : isLoaded,
		get          : get,
		ready        : ready
	};
}();

