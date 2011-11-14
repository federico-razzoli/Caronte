var plugins = new function()
{
	// link & load all extensions
	this.loadAll = function()
	{
		for (var name in extensions) {
			// link js file
			var fileName = "data/ext/" + name.substr(3).toLowerCase();
			link("js", fileName);
			
			// extensions items could be an array of options
			var params = window.extensions[name] ? extensions[name] : [] ;
			
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
		this.plugins[name].options = opt(extensions[name], defaults);
		
		// now options are set; load plugin
		obj.load();
		events.exec("PluginLoaded");
		
		// plugins object is ready?
		this.toLoad--;
		if (this.toLoad == 0) {
			this.ready = true;
			defineEvents();
			events.exec("PluginsReady");
		}
	}
	
	// free memory if the plugin is not needed
	this.unload = function(name)
	{
		unlink("js", "ext/" + name);
		this.plugins[name].end();
		this.plugins[name] = null;
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
