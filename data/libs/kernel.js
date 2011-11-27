/*
	IDRA: Ipertesto Dinamico per Racconti d'Avventura, Version 2
	(C) 2000 Enrico Colombini
	(C) 2011 Federico Razzoli
	
	IDRA is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, version 2 of the License.
	
	IDRA is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with IDRA.  If not, see <http://www.gnu.org/licenses/>.
*/


"use strict";

	// ### eventi needs to be moved to an extension!!! ###
	var eventi = new Object;
		eventi.frasi        = new Array();  // array di frasi che si alternano
		eventi.probabilita  = 5;            // probabilità che una frase sia visualizzata


var menu = new menuHandler("boxMenu");
var v = new Object;

var SW = new function()
{
	/*
	 *    Default Options
	 */
	
	this.defaultOptions =
	{
		showInfo           : true,
		light              : false,
		defaultTheme       : "classic",
		defaultDictionary  : "it",
		defaultLang        : "it"
	};
	
	/*
	 *    Meta Info
	 */
	
	this.info =
	{
		name        : "IDRA",
		URL         : ["https://github.com/santec/IDRA Progetto su GitHub",
					   "http://www.erix.it/idra.html Il vecchio sito ufficiale"],
		version     : "2.0.1",
		APIVersion  : "2.0",
		maturity    : "Sviluppo",
		date        : "2011",
		license     : "GNU GPL 2",
		licenseURL  : "COPYING.txt",
		author      : "Federico Razzoli",
		contacts    : "santec [At) riseup [Dot' net",
		copyright   : "2000 Enrico Colombini\n2011 Federico Razzoli",
		descr       : "Una versione rivisitata di IDRA, un framework per giochi d'avventura scritto da Enrico Colombini.",
		notes       : ""
	};
	
	
	/*
	 *    Properties
	 */
	
	var links            = new Array();   // links created by SW
	var numLinks         = 0;
	var here             = null;         // current page function
	
	
	/*
	 *    Games Variables
	 */

	window.v = new Object;  // contains game variables
	
	
	// ##########################################################################
	// ##  Inizio area funzioni chiamabili dall'autore                         ##
	// ##########################################################################
	
	// ===== Funzioni di cambio pagina ==========================================
	
	// Va alla pagina pag, che viene ricordata nella proprietà here
	// come pagina corrente, chiama:
	// Intestazione(pag) se esiste, pag(), PiePagina(pag) se esiste
	this.goTo = function(pag, args)
	{
		here = pag; // ricorda la pagina
		this.pageBegin();
		events.exec("PageBegin");
		if (typeof args == "undefined") args = null;
		if (window._header)  _header(pag.name, args);
		pag(args); // write page
		if (window._footer)  _footer(pag.name, args);
		events.exec("PageEnd");
		this.pageEnd();
	}

	// check if user-defined function exist before calling
	this.callUserFunc = function(strFunc)
	{
		if (eval("typeof strFunc != 'function'")) {
			eval(strFunc + "()");
			return true;
		} else {
			issue("Undefined function: " + strFunc);
			return false;
		}
	}
	
	// Esegue nuovamente la pagina corrente, cioe' quella ricordata nella variabile here
	this.refresh = function()
	{
		this.goTo(here);
	}
	
	// ===== Funzioni di creazione pagina =======================================
	
	// Scrive l'eventuale titolo della pagina
	this.title = function(tit)
	{
		this.say('<h2>' + tit + "</h2>");
	}
	
	// Scrive (parte del) testo della pagina, inclusi eventuali comandi HTML,
	// accetta un numero variabile di argomenti e li stampa di seguito
	this.say = function()
	{
		if (typeof appLocale == "string") {
			locale.getp(arguments);
		} else {
			for (var i = 0; i < arguments.length; i++) {
				this.boxMain.write(arguments[i]);
			}
		}
	}
	
	// Come say(), ma dopo ogni parametro scrive un a capo (<br>);
	// il tutto inoltre è incluso nei tag <p>...</p>
	// Utile per non scrivere i tag manualmente
	this.sayNl = function()
	{
		var out = "\n<p>\n";
		for (var i = 0; i < arguments.length; i++) {
			out += arguments[i] + "<br>\n";
		}
		out += "\n</p>\n";
		this.say(out);
	}
	
	// stampa una riga vuota
	this.nl = function(n)
	{
		var out;
		if (n < 1) n = 1;
		while (n > 0) {
			out = "\n<br>&nbsp;<br>\n";
			n--;
		}
		this.say(out);
	}
	
	// Come say(), ma dopo ogni parametro scrive un a capo (<br>);
	// il tutto inoltre è incluso nei tag <p>...</p>
	// classeCSS, se non è vuoto/null, è lo stile CSS (attributo HTML class)
	// Utile per non scrivere i tag manualmente
	this.sayNlCSS = function(classeCSS)
	{
		var out;
		if (classeCSS) out = "\n<p class=\"" + classeCSS + "\">\n";
		else out = "\n<p>\n";
		for (var i = 1; i < arguments.length; i++) {
			out += arguments[i] + "<br>\n";
		}
		out += "\n</p>\n";
		this.say(out);
	}
	
	// Show a message and a link to prev location or another action
	//    @txt      : String     : Message
	//    @action   : mixed      : Function or string to execute; default: here
	this.message = function(txt, action)
	{
		this.pageBegin();
		this.say("<p>" + txt + "</p>\n");
		if (action == null) action = here;
		this.option("Continua", action);
		this.pageEnd();
		//modal.info(txt);
	}
	
	// Aggiunge una scelta al menu della pagina se la condizione cond e' vera,
	// desc e' il testo da mostrare, act e' l'azione da compiere in caso di clic
	// Se chiamata con due soli argomenti, sono desc e act (la condizione e' sempre vera).
	// SW.option(cond, desc, act)
	// SW.option(desc, act)
	this.option = function(p1, p2, p3)
	{
	  var cond = p1; var desc = p2; var act = p3 //3 argomenti
	  if (arguments.length == 2) { cond = 1; desc = p1; act = p2 } //2 argomenti
	  if (cond) {
		this.say("<ul><li>") //usa stile 'lista' mettendo la scelta in una lista a se' stante
		this.link(desc, act) //aggiunge scelta nel testo
		this.say("</li></ul>")
	  }
	} 
	
	// Aggiunge una scelta nel testo, ricorda l'azione in links[], il link e'
	// preceduto da idPagina per evitare problemi con la navigazione del browser
	this.link = function(desc, act)
	{
		this.say("<a href=\"javascript:SW.exec('" + numLinks + "');\">");
		this.say(desc, "</a>");
		links[numLinks] = act;
		numLinks++;
	}
	
	// Aggiunge la scelta "Continua"; se cond e' vera usa act1, altrimenti act2
	// Se chiamata con un solo argomento, aggiunge la scelta in ogni caso
	// SW.more(cond, act1, act2)
	// SW.more(act)
	this.more = function(p1, p2, p3)
	{
	  var cond = p1; var act1 = p2; var act2 = p3 //3 argomenti
	  if (arguments.length == 1) { cond = 1; act1 = p1 } //1 argomento
	  if (cond) {
		this.option(cond, "Continua", act1)
	  } else if (act2) {
		this.option(!cond, "Continua", act2) 
	  }
	}
	
	// ===== Funzioni di apertura e chiusura pagina =============================
	
	// assegna un identificatore univoco per rilevare problemi causati dai comandi 
	// di navigazione del browser, azzera il contatore delle scelte
	this.pageBegin = function(opzioni, stylesheet)
	{
		numLinks = 0; // reset contatore scelte
	}
	
	// Termina la scrittura di una pagina
	this.pageEnd = function()
	{
		this.boxMain.send();
	}
	
	// ===== Funzioni ausiliarie ================================================
	
	// Ritorna il nome di una pagina (funzione)
	this.pageName = function(p)
	{
		var s = p.toString();
		// salta "function" e uno spazio, tiene fino alla parentesi esclusa
		return this.trim(s.substring(9, s.indexOf("(", 0)));
	}
	
	// Tira un dado a n facce (6 se non indicate), ritorna un intero tra 1 e n
	this.dice = function(num)
	{
		if (num == null) num = 6; // default: 6 facce
		return(Math.floor(Math.random() * (num - 1)) + 1); 
	}
	
	// Elimina gli spazi attorno a una stringa (ritorna una nuova stringa)
	this.trim = function(s)
	{
		var inizio  = 0;
		var fine    = s.length; //primo carattere oltre la fine
		if (fine > 0) {
			while (s.charAt(inizio) == " ") inizio++;
			while (s.charAt(fine - 1) == " " && fine > inizio) fine--;
		}
		return s.substring(inizio, fine);
	}
	
	// ##########################################################################
	// ##  Fine area funzioni chiamabili dall'autore                           ##
	// ##########################################################################
	
	// ===== Avvio, riavvio e informazioni  =====================================
	
	this.infoMenu = function()
	{
		var secInfo = menu.addSection("secInfo", locale.get("about"), locale.get("aboutTitle"));
		if (typeof info != "undefined") {
			secInfo.addButton("bttInfoApp",  "SW.showInfo(info)",  null,  locale.get("infoApp"),  locale.get("infoAppTitle"));
		}
		secInfo.addButton("bttInfoSW",  "SW.showInfo(SW.info)",  null,  this.info.name, locale.get("infoAbout", this.info.name));
		for (var p in plugins.get()) {
			if (typeof plugins.get(p).info != "undefined") {
				secInfo.addButton("bttInfoPlugin" + p,  "SW.showInfo(plugins.get('" + p + "').info)",  null,  p,  locale.get("infoAboutExt", p));
			}
		}
		if (typeof dictInfo != "undefined") {
			secInfo.addButton("bttInfoDict",  "SW.showInfo(dictInfo)",  null,  locale.get("dictionary"),  locale.get("currentDictionary"));
		}
	}
	
	this.showInfo = function(infoSet)
	{
		if (typeof infoSet != "undefined") {
			var out = "";
			if (infoSet["name"] || infoSet["title"])
				out += "<p><strong>" + 
					   locale.get("infoAbout", infoSet["name"] ? infoSet["name"] : infoSet["title"]) + 
					   "</strong></p>\n";
			out += '<table border="0">\n';
			if (infoSet["version"]) {
				var version = (infoSet["maturity"]) ?
					infoSet["version"] + " (" + infoSet["maturity"] + ")" :
					infoSet["version"];
				out += "  <tr>\n" +
					   "    <td>" + locale.get("version") + "</td>\n" +
					   "    <td>" + version + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["URL"]) {
				var URL = "";
				if (isArray(infoSet["URL"])) {
					for (var u in infoSet["URL"]) {
						// split url from text?
						var p = infoSet["URL"][u].indexOf(" ");
						if (p > 0) {
							var linkURL   = infoSet["URL"][u].substr(0, p);
							var linkText  = infoSet["URL"][u].substr(p);
						} else {
							// there's no text
							var linkURL   = infoSet["URL"][u];
							var linkText  = linkURL;
						}
						if (URL) URL += "<br>";
						URL += '<a href="' + linkURL + '">' + linkText + "</a>";
					}
				} else {
					var p = infoSet["URL"].indexOf(" ");
					if (p > 0) {
						var linkURL   = infoSet["URL"].substr(0, p);
						var linkText  = infoSet["URL"].substr(p);
					} else {
						// there's no text
						var linkURL   = infoSet["URL"];
						var linkText  = linkURL;
					}
					URL += '<a href="' + linkURL + '">' + linkText + "</a>";
				}
				out += "  <tr>\n" +
					   "    <td>" + locale.get("URL") + "</td>\n" +
					   "    <td>" + URL + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["APIVersion"]) {
				out += "  <tr>\n" +
					   "    <td>" + locale.get("APIVersion") + "</td>\n" +
					   "    <td>" + infoSet["APIVersion"] + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["author"]) {
				out += "  <tr>\n" +
					   "    <td>" + locale.get("author") + "</td>\n" +
					   "    <td>" + infoSet["author"] + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["contacts"]) {
				out += "  <tr>\n" +
					   "    <td>Contacts</td>\n" +
					   "    <td>" + locale.get("contacts") + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["copyright"]) {
				out += "  <tr>\n" +
					   "    <td>" + locale.get("copyright") + "</td>\n" +
					   "    <td>" + infoSet["copyright"].replace("\n", "<br>") + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["license"] || infoSet["licenseURL"]) {
				var license;
				if (infoSet["license"] && infoSet["licenseURL"])
					license = '<a href="' + infoSet["licenseURL"] + '">' + infoSet["license"] + "</a>";
				else if (infoSet["license"])
					license = ""+infoSet["license"];
				else
					license = '<a href="' + infoSet["licenseURL"] + '">' + infoSet["licenseURL"] + "</a>";
				out += "  <tr>\n" +
					   "    <td>" + locale.get("license") + "</td>\n" +
					   "    <td>" + license + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["descr"]) {
				out += "  <tr>\n" +
					   "    <td>" + locale.get("description") + "</td>\n" +
					   "    <td>" + infoSet["descr"].replace("\n", "<br>") + "</td>\n" +
					   "  </tr>\n";
			}
			if (infoSet["notes"]) {
				out += "  <tr>\n" +
					   "    <td>" + locale.get("notes") + "</td>\n" +
					   "    <td>" + infoSet["notes"].replace("\n", "<br>") + "</td>\n" +
					   "  </tr>\n";
			}
			out += "</table>\n";
			modal.info(out);
		} else {
			modal.info(local.get("noInfo"));
		}
	}
	
	// (re)start the App. Call plugins.loadAll() + start
	this.prepare = function()
	{
		// assign Application options
		if (typeof defaultOptions == "undefined")
			window.defaultOptions = null;
		options = new opt(options, defaultOptions);
		window.defaultOptions = undefined;
		
		// assign SW options
		if (typeof this.defaultOptions == "undefined")
			this.defaultOptions = null;
		this.options = new opt(SWOptions, this.defaultOptions);
		window.SWOptions = undefined; // cant delete globals in strict mode
		delete this.defaultOptions;
		
		// load localization file
		queue.add("link('js', 'data/locale/' + SW.options.get('defaultLang'))", ["@conf"], "locale");
		
		// load dictionary
		if (typeof dictionary == "undefined") window.dictionary = this.options.get("defaultDictionary");
		if (dictionary != "") link("js", "data/dict/" + dictionary);
		else var dictOk = true;
		
		if (typeof extensions == "undefined") window.extensions = new Object;
		
		// erase if exists
		menu.erase();
		
		var sound = menu.addSection("secSound");
		sound.addButton("bttMusic",  "playstop()",  null,  "Musica:&nbsp;&nbsp;S&igrave;",  "Attiva/Disattiva la musica");
		sound.addButton("bttFx",     "fx()",        null,  "Suoni:&nbsp;&nbsp;S&igrave;",   "Attiva/Disattiva i suoni");
		
		gui.erase();
		this.boxMain = gui.createArea("boxMain", "box");
		
		// load extensions
		plugins.loadAll();
		
		if (this.options.get("no_exec") !== true)
			queue.add("SW.start()",            ["?typeof plugins != 'undefined' && plugins.ready",  "dictOk"]);
	}
	
	this.start = function()
	{
		gui.draw();
		
		// add info section + draw() menu
		if (SW.options.get("showInfo") != "0") SW.infoMenu();
		menu.draw();
		
		here = null; // no page open
		v = new Object(); // re-alloc to clean garbage
		
		if (typeof info != "undefined") {
			if (typeof info.title != "undefined")
				parent.document.title = info.title;
			else if (typeof info.name != "undefined")
				parent.document.title = info.name;
		}
		
		events.exec("ApplicationBegin");
		
		// initialize start Application
		this.callUserFunc("Inizia");
	}
	
	// Esegue l'azione act, che puo' essere:
	// - una stringa da eseguire, ad esempio "goTo(P1)"
	// - una funzione (pagina) a cui andare, ad esempio P1
	this.exec = function(act, args)
	{
		act = links[act];
		if (typeof(act) == "function") { //se e' una funzione (pagina)
			this.goTo(act, args);
		} else if (typeof(act) == "string") { //se e' una stringa
			eval(act);
		}
	}
	
	// Rimette il gioco nello stato descritto dalla stringa state
	this.ripristinaStato = function(state)
	{
		state           = state.split("|");
		var listKeys    = state[0];
		var listValues  = state[1];
		var curPair     = 0;  // current key/value pair
		var len         = listValues.length;  // listValues len, used to loop through chars
		for (curChar = 0; curChar < len; chrChar++) {
			
		}
		// get & redraw current page
		here = state[2];
	}
}

// Date alcune frasi (o comunque stringhe) ne restituisce una a caso

function FraseCasuale()
{
	var num = SW.dice(arguments.length);
	return arguments[num];
}

// Eventi casuali

function Eventi()
{
	var eTesto;
	if (SW.dice(100) <= eventi.probabilita) {
		eTesto = eventi.frasi[SW.dice(eventi.frasi.length)];
		SW.sayNlCSS("evidFrase", eTesto);
	}
}

