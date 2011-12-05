// Estensioni oggetti e inventario per Caronte e IDRA
// (C) 2000 Enrico Colombini
// (C) 2011 Federico Razzoli
// Free software sotto la licenza GNU GPL 2

// Realizzato su suggerimento di Tommaso Percivale con un'interfaccia simile a
// quella del sistema ILES (Interactive Literature Editing System) creato da 
// Alberto Morena e Tommaso Percivale e impiegato nei libri gioco chiamati "IperLibri"

// Questo file estende Caronte: le parti di programmazione HTML 
// e JavaScript qui contenute sono soggette alla medesima licenza GNU GPL 2.


"use strict";

funcExts["extObjects"] = function()
//var extObjects = function()
{
	this.load = function()
	{
		// box
		boxObjects = gui.createArea("boxObjects", "box", this.options.get("title"), false, this.options.get("size"));
		boxObjects.setCSSProperty(this.options.get("backgroundColor"), "backgroundColor");
		
		// re-init vars
		selected         = "";           // nessun oggetto attualmente selezionato
		objects          = "";           // conterra' l'array con la lista di oggetti e descrizioni
		choises          = [];           // ogni elemento conterra' una tavola di scelte
		numChoises       = 0;
		
		// clean default
		delete this.defaultOptions;
	}
	
	this.unload = function() { }
	
	/*
	 *    Public Methods
	 */
	
	// Definisce gli oggetti: deve passare un array contenente, alternati,
	// il nome della variabile di oggetto (senza .v) e la descrizione da mostrare;
	// usa un array invece di un hash table per mantenere l'ordine dell'autore
	this.definisciOggetti = function(elenco)
	{
		objects = elenco;
	}
	
	// Scrive/aggiorna area oggetti, selezionando l'oggetto ogg, se indicato;
	// per deselezionare passare un nome non valido, ad esempio ""
	this.show = function(ogg)
	{
		// select/unselect object
		selected = (selected === ogg) ? "" :  ogg;
		// fill boxObjects
		for (var i = 0; i < objects.length;  i += 2) { //scandisce possibili oggetti
			ogg = objects[i]; //variabile corrispondente all'oggetto
			if (v[ogg] > 0) {
				//mostra se la variabile corrispondente e' positiva
				var desc = objects[i + 1]; //descrizione oggetto da mostrare
				// separator
				if (i > 0) {
					boxObjects.write("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
				}
				boxObjects.write("<a href=\"javascript:plugins.get('extObjects').show('" + ogg + "')\">");
				var sel = (ogg === selected); //vera se l'oggetto e' selezionato
				//default: usa <b> per evidenziare oggetto selezionato
				if (sel) {
					boxObjects.write("<strong>" + desc + "</strong>");
				} else {
					boxObjects.write(desc);
				}
				boxObjects.write("</a>");
			}
		}
		boxObjects.send();
		numChoises = 0; // reset counter
	}
	
	// Aggiunge, nel testo della pagina, un rinvio dipendente dall'oggetto selezionato;
	// la lista degli argomenti va letta come (defaultAct, ogg1, act1, ogg2, act2, ...) 
	// l'oggetto "+" indica tutti gli oggetti non esplicitamente indicati, l'azione
	// corrispondente verra' eseguita se c'e' un oggetto selezionato, ma non e' in lista
	this.rinvioOgg = function(desc, defaultAct) //seguono argomenti opzionali, vedi sopra
	{
		var tavola = {}; //hash table con coppie oggetto-azione
		tavola["-"] = defaultAct;
		for (var i = 1; i < arguments.length; i++) {
			tavola[arguments[i]] = arguments[i + 1];
		}
		//crea un rinvio che chiamera' eseguiRinvioOgg('indice')
		rinvio(desc, "plugins.get(\"extObjects\").eseguiRinvioOgg('" + numChoises + "')");
		choises[numChoises] = tavola; //associa l'intera hash table all'azione
		numChoises++;
	}
	
	// Identica a rinvioOgg, ma mostra l'opzione come una scelta
	this.sceltaOgg = function(desc, defaultAct)
	{ //seguono argomenti opzionali, vedi sopra
		var tavola = new Object() //hash table con coppie oggetto-azione
		tavola["-"] = defaultAct
		for (var i = 1; i < arguments.length; i++) {
			tavola[arguments[i]] = arguments[i + 1]
		}
		//crea un rinvio che chiamera' eseguiRinvioOgg('indice')
		scelta(desc, "plugins.get('extObjects').eseguiRinvioOgg('" + numChoises + "')")
		choises[numChoises] = tavola; //associa l'intera hash table all'azione
		numChoises++;
	}
	
	/*
	 *    Events
	 */
	
	// when page ends, update boxObjects
	this.onPageEnd = function()
	{ //seguono argomenti opzionali, vedi sopra
		this.show("");
	}
	
	/*
	 *    Private Methods
	 */
	
	// Effetto del clic su un rinvioOgg (rimandato da Idra): esegue l'azione associata 
	// all'oggetto correntemente selezionato se c'e', altrimenti quella di default
	this.eseguiRinvioOgg = function(indice)
	{
		var lista = choises[indice];
		var act = null; //azione da eseguire
		if (selected) { //se c'e' un oggetto selezionato
			act = lista[selected]; //sceglie l'azione corrispondente
			if (! act) { //se non e' prevista un'azione per questo oggetto
				act = lista["+"]; //usa l'azione generica per "un qualsiasi oggetto"
			}
		}
		if (!act) { //se ancora non e' definita, usa il default
			act = lista["-"];
		}
		if (typeof(act) == "function") { //se e' una funzione (pagina) ci va
			vai(act);
		} else if (typeof(act) == "string") { //se e' una stringa, la esegue come codice
			if (act) eval(act);
		}
	}
	
	this.info =
	{
		name        : "Objects",
		URL         : "",
		version     : "0.1",
		APIVersion  : "2.0",
		maturity    : "Release Candidate",
		date        : "2011",
		license     : "GPLv2",
		licenseURL  : "",
		author      : "Federico Razzoli",
		contacts    : "santec [At) riseup [Dot' net",
		copyright   : "2000 Enrico Colombini\n2011 Federico Razzoli",
		descr       : "Support for inventory and objects.",
		notes       : "Derived from Erix's Oggetti extension for IDRA. Adapted for Caronte."
	}
	
	this.defaultOptions =
	{
		title            : "",
		size             : 20,
		backgroundColor  : "#DDDDDD"
	}
	
	this.dictionary = ["it"];
	
	// initialize private props
	var selected     = "";
	var objects      = "";
	var choises      = [];
	var numChoises   = "";
	var boxObjects;
}

