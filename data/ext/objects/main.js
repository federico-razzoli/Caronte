// Estensioni oggetti e inventario per Idra
// (C) 2000 Enrico Colombini
// (C) 2011 Federico Razzoli
// Free software sotto la licenza GNU GPL 2

// Realizzato su suggerimento di Tommaso Percivale con un'interfaccia simile a
// quella del sistema ILES (Interactive Literature Editing System) creato da 
// Alberto Morena e Tommaso Percivale e impiegato nei libri gioco chiamati "IperLibri"

// Questo file estende Idra: le parti di programmazione HTML 
// e JavaScript qui contenute sono soggette alla medesima licenza GNU GPL
// di Idra stesso.


"use strict";

function extObjects()
{
	this.load = function()
	{
		// box
		
		this.boxObjects = gui.createArea("boxObjects", "box", this.options.get("title"), false, this.options.get("size"));
		this.boxObjects.setCSSProperty(this.options.get("backgroundColor"), "backgroundColor");
		
		// ===== Variabili ==========================================================
		
		this.selez       = "";           // nessun oggetto attualmente selezionato
		this.datiOgg     = "";           // conterra' l'array con la lista di oggetti e descrizioni
		this.scelte      = new Array;    // ogni elemento conterra' una tavola di scelte
		this.nscelte     = 0;            // non usa nscelte di Idra per pulizia del codice
		this.preRinvio   = "";           // per evidenziare i rinvii su cui si puo' agire con oggetti
		this.postRinvio  = "";
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
		this.datiOgg = elenco;
	}
	
	// Imposta opzioni per evidenziare i rinvii su cui agire con gli oggetti
	this.opzioniRinvioOgg = function(pre, post)
	{
		this.preRinvio   = pre;
		this.postRinvio  = post;
	}
	
	// Ritorna il nome dell'oggetto selezionato, corrispondente al nome della
	// variabile che lo controlla, senza la v. iniziale
	this.ogg = function()
	{
		return this.selez;
	}
	
	// Scrive testo dell'area oggetti, inclusi eventuali comandi HTML,
	// accetta un numero variabile di argomenti e li stampa di seguito
	this.testoOggetti = function()
	{
		for (var i = 0; i < arguments.length; i++) {
			this.boxObjects.write(arguments[i]);
		}
		this.boxObjects.send();
	}
	
	// Scrive/aggiorna area oggetti, selezionando l'oggetto ogg, se indicato;
	// per deselezionare passare un nome non valido, ad esempio "";
	// per descrivere l'oggetto chiama la funzione utente DescriviOggetto,
	// se esiste, passando il nome, la descrizione e se l'oggetto e' selezionato
	this.show = function(ogg)
	{
		// select/unselect object
		if (this.selez == ogg)
			this.selez = "";
		else
			this.selez = ogg;
		// creare finestra
		for (var i = 0; i < this.datiOgg.length;  i += 2) { //scandisce possibili oggetti
			var ogg = this.datiOgg[i]; //variabile corrispondente all'oggetto
			if (eval("v." + ogg) > 0) {
				//mostra se la variabile corrispondente e' positiva
				var desc = this.datiOgg[i + 1]; //descrizione oggetto da mostrare
				// separator
				if (i > 0) {
					this.boxObjects.write("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
				}
				this.boxObjects.write("<a href=\"javascript:plugins.get('extObjects').show('" + ogg + "')\">");
				var selez = (ogg == this.selez); //vera se l'oggetto e' selezionato
				if (window.DescriviOggetto) {
					//chiama funzione utente per scrivere o disegnare
					DescriviOggetto(ogg, desc, selez);
				} else {
					//default: usa <b> per evidenziare oggetto selezionato
					if (selez) {
						this.boxObjects.write("<strong>" + desc + "</strong>");
					} else {
						this.boxObjects.write(desc);
					}
				}
				this.boxObjects.write("</a>");
			}
		}
		this.boxObjects.send();
		this.nscelte = 0; //azzera contatore di identificazione per rinvioOgg
	}
	
	// Aggiunge, nel testo della pagina, un rinvio dipendente dall'oggetto selezionato;
	// la lista degli argomenti va letta come (defaultAct, ogg1, act1, ogg2, act2, ...) 
	// l'oggetto "+" indica tutti gli oggetti non esplicitamente indicati, l'azione
	// corrispondente verra' eseguita se c'e' un oggetto selezionato, ma non e' in lista
	this.rinvioOgg = function(desc, defaultAct) //seguono argomenti opzionali, vedi sopra
	{
		var tavola = new Object() //hash table con coppie oggetto-azione
		tavola["-"] = defaultAct;
		for (var i = 1; i < arguments.length; i++) {
			tavola[arguments[i]] = arguments[i + 1];
		}
		//crea un rinvio che chiamera' eseguiRinvioOgg('indice')
		rinvio(this.preRinvio + desc + this.postRinvio, "plugins.get(\"extObjects\").eseguiRinvioOgg('" + this.nscelte + "')");
		this.scelte[this.nscelte] = tavola; //associa l'intera hash table all'azione
		this.nscelte++;
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
		scelta(this.preRinvio + desc + this.postRinvio, "plugins.get('extObjects').eseguiRinvioOgg('" + this.nscelte + "')")
		this.scelte[this.nscelte] = tavola //associa l'intera hash table all'azione
		this.nscelte++
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
		var lista = this.scelte[indice]
		var act = null //azione da eseguire
		if (this.selez) { //se c'e' un oggetto selezionato
			act = lista[this.selez] //sceglie l'azione corrispondente
			if (! act) { //se non e' prevista un'azione per questo oggetto
				act = lista["+"] //usa l'azione generica per "un qualsiasi oggetto"
			}
		}
		if (! act) { //se ancora non e' definita, usa il default
			act = lista["-"]
		}
		if (typeof(act) == "function") { //se e' una funzione (pagina) ci va
			vai(act)
		} else if (typeof(act) == "string") { //se e' una stringa, la esegue come codice
			if (act) { eval(act) }
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
		notes       : "Derived from Erix's Oggetti extension for IDRA. Adapted for IDRA2."
	}
	
	this.defaultOptions =
	{
		title            : "",
		size             : 20,
		backgroundColor  : "#DDDDDD"
	}
	
	this.dictionary = true;
}
