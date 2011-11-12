function maze()
{
	// members
	
	this.solutions  = new Array();
	this.exits      = new Array();
	this.numExits   = 0;
	this.longest    = 0;
	
	this.path       = "";
	
	// accessory methods
	
	// specify new exit - path-to-exit;
	// return exit's id (integer)
	this.addExit = function(exit, solution)
	{
		this.numExits = this.exits.push(exit);
		this.solutions.push(solution);
		if (solution.length > this.longest)
			this.longest = solution.length;
		return numExits - 1;
	}
	
	// go to the specified direction;
	// if you reached the exit, returns exit function;
	// else, returns the path (so that you can store it in v).
	// returned path is never longer than longest solution.
	this.go = function(direction)
	{
		this.path += direction;
		if (this.path.length > this.longest)
			this.path  = this.path.substr(1);
		for (var i = this.solutions.length - 1; i >= 0; i--) {
			if (this.path == this.solutions[i])
				return this.solutions[i];
		}
		return this.path;
	}
}
