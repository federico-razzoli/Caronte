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

/*
 *    MetaInfo
 */

var SW = new Object();

SWDefaultOptions =
{
	showInfo     : true
};

SW.info =
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
 *    Variables
 */

var scelte             = new Array();  // scelte valide (stringhe contenenti codice o funzioni)
var nscelte            = 0;
var qui                = null;         // current page function
var lastArgs           = null;         // current page arguments
var statoPrecedente    = null;         // situazione prima dell'esecuzione della pagina corrente
var situazioneSalvata  = null;         // usata per salvare se non funzionano i cookie
var nomeCookie         = "game";       // per il salvataggio su disco
var durataCookie       = 365;          // giorni


/*
 *    User Interface
 */

var boxMain = gui.createArea("boxMain", "box");
gui.draw();

var menu = new menuHandler("boxMenu");


/*
 *    Games Variables
 */

var v = new Object();  // contains game variables

// Eventi

var eventi = new Object;
    eventi.frasi        = new Array();  // array di frasi che si alternano
	eventi.probabilita  = 5;            // probabilità che una frase sia visualizzata


// ##########################################################################
// ##  Inizio area funzioni chiamabili dall'autore                         ##
// ##########################################################################


// ===== Funzioni di cambio pagina ==========================================


// Va alla pagina pag, che viene ricordata nella variabile qui
// come pagina corrente, chiama:
// Intestazione(pag) se esiste, pag(), PiePagina(pag) se esiste,
// prima di mostrare la pagina salva la situazione in statoPrecedente

function vai(pag, args)
{
	qui = pag; // ricorda la pagina
	statoPrecedente = creaStringaStato(); //situazione prima di eseguire la pagina
	apriPagina();
	events.exec("PageBegin");
	if (typeof args == "undefined") args = null;
	if (window.Intestazione)  Intestazione(pag.name, args);
	pag(args); // write page
	if (window.PiePagina)     PiePagina(pag.name, args);
	events.exec("PageEnd");
	chiudiPagina();
}

// check if user-defined function exist before calling
function callUserFunc(strFunc)
{
	if (eval("typeof strFunc != 'function'")) {
		eval(strFunc + "()");
		return true;
	} else {
		issue("Undefined function: " + strFunc);
		return false;
	}
}

function messaggioPrima(pag)
{
	statoPrecedente = creaStringaStato(); //situazione prima di eseguire la pagina
	apriPagina();
	if (window.Intestazione) Intestazione(pag);
}

function messaggioDopo(pag)
{
	if (window.PiePagina) PiePagina(pag);
	chiudiPagina();
}


// Mostra la pagina pag, senza ricordarla nella variabile qui; non chiama
// ne' Intestazione() ne' PiePagina() ma solo pag(), eventuali opzioni
// vanno esplicitamente passate come argomento (lo si puo' tralasciare)

function mostra(pag, opzioni)
{
	apriPagina(opzioni);
	pag(); //scrive la pagina
	chiudiPagina();
}


// Esegue nuovamente la pagina corrente, cioe' quella ricordata nella variabile qui

function aggiorna()
{
	vai(qui, lastArgs);
}


// Ridisegna la pagina corrente (qui) senza eseguirla, in modo che non cambi lo stato,
// lo fa partendo dallo stato precedente all'esecuzione e poi eseguendola

function ridisegna()
{
  ripristinaStato(statoPrecedente)
  aggiorna() //avendo ripristinato lo statoPrecedente, ricostruisce quello attuale
}


// ===== Funzioni di creazione pagina =======================================


// Scrive l'eventuale titolo della pagina

function titolo(tit)
{
	testo('<h2>' + tit + "</h2>")
}


// Scrive (parte del) testo della pagina, inclusi eventuali comandi HTML,
// accetta un numero variabile di argomenti e li stampa di seguito

function testo()
{
	for (var i = 0; i < arguments.length; i++) {
		boxMain.write(arguments[i]);
	}
}

// Come testo(), ma dopo ogni parametro scrive un a capo (<br>);
// il tutto inoltre è incluso nei tag <p>...</p>
// Utile per non scrivere i tag manualmente
function testoNl(testo)
{
	var out = "\n<p>\n";
	for (var i = 0; i < arguments.length; i++) {
		out += arguments[i] + "<br>\n";
	}
	out += "\n</p>\n";
	this.testo(out);
}

// stampa una riga vuota
function nl(n)
{
	var out;
	if (n < 1) n = 1;
	while (n > 0) {
		out = "\n<br>&nbsp;<br>\n";
		n--;
	}
	testo(out);
}


// Come testo(), ma dopo ogni parametro scrive un a capo (<br>);
// il tutto inoltre è incluso nei tag <p>...</p>
// classeCSS, se non è vuoto/null, è lo stile CSS (attributo HTML class)
// Utile per non scrivere i tag manualmente
function testoNlCSS(classeCSS) {  // federico razzoli
	var out;
	if (classeCSS) out = "\n<p class=\"" + classeCSS + "\">\n";
	else out = "\n<p>\n";
	for (var i = 1; i < arguments.length; i++) {
		out += arguments[i] + "<br>\n";
	}
	out += "\n</p>\n";
	testo(out);
}


// Visualizza testo e mostra il link per tornare alla pagina precedente
// Utile per visualizzare un messaggio dopo un'azione

function Messaggio(txt) {
  apriPagina();
  testoNl(txt);
  scelta("Continua", "ridisegna()");
  chiudiPagina();
}


// effetto sonoro

function suono(file) {
	//if (!v.disabilitaSuoni)
	//	gui.write('\n<embed src="' + gioco.suoniDir + '/' + file + '" loop="false" hidden="true" autostart="true">\n');
}


// Aggiunge una scelta al menu della pagina se la condizione cond e' vera,
// desc e' il testo da mostrare, act e' l'azione da compiere in caso di clic
// Se chiamata con due soli argomenti, sono desc e act (la condizione e' sempre vera).

// scelta(cond, desc, act)
// scelta(desc, act)

function scelta(p1, p2, p3) {
  var cond = p1; var desc = p2; var act = p3 //3 argomenti
  if (arguments.length == 2) { cond = 1; desc = p1; act = p2 } //2 argomenti
  if (cond) {
    testo("<ul><li>") //usa stile 'lista' mettendo la scelta in una lista a se' stante
    rinvio(desc, act) //aggiunge scelta nel testo
    testo("</li></ul>")
  }
} 


// Aggiunge una scelta nel testo, ricorda l'azione in scelte[], il link e'
// preceduto da idPagina per evitare problemi con la navigazione del browser

function rinvio(desc, act) {
	//associa al link una chiamata a eseguiScelta('idPagina:scelta')
	//testo("<a href=\"javascript:eseguiScelta('", idPagina, ":", nscelte, "');\">");
	testo("<a href=\"javascript:esegui('" + nscelte + "');\">");
	testo(desc, "</a>");
	scelte[nscelte] = act;
	nscelte++;
}


// Aggiunge la scelta "Continua"; se cond e' vera usa act1, altrimenti act2
// Se chiamata con un solo argomento, aggiunge la scelta in ogni caso

// continua(cond, act1, act2)
// continua(act)

function continua(p1, p2, p3) {
  var cond = p1; var act1 = p2; var act2 = p3 //3 argomenti
  if (arguments.length == 1) { cond = 1; act1 = p1 } //1 argomento
  if (cond) {
    scelta(cond, "Continua", act1)
  } else if (act2) {
    scelta(! cond, "Continua", act2) 
  }
}


// ===== Funzioni di apertura e chiusura pagina =============================


// assegna un identificatore univoco per rilevare problemi causati dai comandi 
// di navigazione del browser, azzera il contatore delle scelte

function apriPagina(opzioni, stylesheet)
{
	nscelte = 0; // reset contatore scelte
}


// Termina la scrittura di una pagina

function chiudiPagina()
{
	boxMain.send();
}


// ===== Funzioni ausiliarie ================================================


// Imposta opzioni per il salvataggio su disco

function opzioniCookie(nome, giorni) {
  nomeCookie = nome
  durataCookie = giorni
}


// Ritorna la pagina corrente (evita accesso diretto alle variabili del programma)

function pagina() {
	return qui;
}


// Ritorna il nome di una pagina (funzione)

function nomePagina(p) {
  var s = p.toString() //lista la funzione corrispondente alla pagina
  // salta "function" e uno spazio, tiene fino alla parentesi esclusa
  return levaSpaziAttorno(s.substring(9, s.indexOf("(", 0)))
}


// Tira un dado a n facce (6 se non indicate), ritorna un intero tra 1 e n

function dado(n) {
  if (! n) { n = 6 } // default: 6 facce
  return Math.floor(n * caso() + 1) //non usare random(), dev'essere ripristinabile
}
/*
function dado(n) {
  if (! n) { n = 6 } // default: 6 facce
  return(Math.floor(Math.random() * (n - 1)) + 1); 
}
*/
// Elimina gli spazi attorno a una stringa (ritorna una nuova stringa)

function levaSpaziAttorno(s) {
  var inizio = 0
  var fine = s.length //primo carattere oltre la fine
  if (fine > 0) {
    while (s.charAt(inizio) == " ") { inizio++; }
    while (s.charAt(fine - 1) == " " && fine > inizio) { fine--; }  
  }
  return s.substring(inizio, fine)
}


// ##########################################################################
// ##  Fine area funzioni chiamabili dall'autore                           ##
// ##########################################################################


// ===== Avvio, riavvio e informazioni  =====================================


function infoMenu()
{
	var secInfo = menu.addSection("secInfo", "Info su...", "Informazioni sui software in uso");
	if (typeof info != "undefined") 
		secInfo.addButton("bttInfoApp",  "showInfo(info)",  null,  "Questa Applicazione",  "Informazioni su questa Applicazione");
	secInfo.addButton("bttInfoSW",  "showInfo(SW.info)",  null,  "IDRA",  "Informazioni su IDRA");
	for (var p in plugins.get()) {
		secInfo.addButton("bttInfoPlugin" + p,  "showInfo(plugins.get('" + p + "').info)",  null,  p,  "Informazioni sull'Estensione " + p);
	}
}

function showInfo(infoSet)
{
	var out = "";
	if (infoSet["name"] || infoSet["title"])
		out += "<p><strong>Info su " + 
		       infoSet["name"] ? infoSet["name"] : infoSet["title"] + 
			   "</strong></p>\n";
	out += '<table border="0">\n';
	if (infoSet["version"]) {
		var version = (infoSet["maturity"]) ?
			infoSet["version"] + " (" + infoSet["maturity"] + ")" :
			infoSet["version"];
		out += "  <tr>\n" +
		       "    <td>Version</td>\n" +
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
		       "    <td>URL</td>\n" +
			   "    <td>" + URL + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["APIVersion"]) {
		out += "  <tr>\n" +
		       "    <td><nobr>API Version</nobr></td>\n" +
			   "    <td>" + infoSet["APIVersion"] + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["author"]) {
		out += "  <tr>\n" +
		       "    <td>Author</td>\n" +
			   "    <td>" + infoSet["author"] + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["contacts"]) {
		out += "  <tr>\n" +
		       "    <td>Contacts</td>\n" +
			   "    <td>" + infoSet["contacts"] + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["copyright"]) {
		out += "  <tr>\n" +
		       "    <td>Copyright</td>\n" +
			   "    <td>" + infoSet["copyright"].replace("\n", "<br>") + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["URL"]) {
		out += "  <tr>\n" +
		       "    <td>Description</td>\n" +
			   "    <td>" + infoSet["descr"].replace("\n", "<br>") + "</td>\n" +
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
		       "    <td>License</td>\n" +
			   "    <td>" + license + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["descr"]) {
		out += "  <tr>\n" +
		       "    <td>Description</td>\n" +
			   "    <td>" + infoSet["descr"].replace("\n", "<br>") + "</td>\n" +
			   "  </tr>\n";
	}
	if (infoSet["notes"]) {
		out += "  <tr>\n" +
		       "    <td>Notes</td>\n" +
			   "    <td>" + infoSet["notes"].replace("\n", "<br>") + "</td>\n" +
			   "  </tr>\n";
	}
	out += "</table>\n";
	modal.info(out);
}

function prepare()
{
	// assign Application options
	if (typeof defaultOptions == "undefined")
		defaultOptions = null;
	options      = new opt(options,    defaultOptions);
	
	// assign SW options
	SW.options   = new opt(SWOptions,  SWDefaultOptions);
	delete SWOptions;
	delete SWDefaultOptions;
	
	qui = null; // no page open
	v = new Object(); // re-alloc to clean garbage
	gioco = new Object();
	
	if (typeof info != "undefined") {
		if (typeof info.title != "undefined")
			parent.document.title = info.title;
		else if (typeof info.name != "undefined")
			parent.document.title = info.name;
	}
	
	var sound = menu.addSection("secSound");
	sound.addButton("bttMusic",  "playstop()",  null,  "Musica:&nbsp;&nbsp;S&igrave;",  "Attiva/Disattiva la musica");
	sound.addButton("bttFx",     "fx()",        null,  "Suoni:&nbsp;&nbsp;S&igrave;",   "Attiva/Disattiva i suoni");
	
	var saveMe = menu.addSection("secSaveMe");
	saveMe.addButton("bttSave",     "save()",     null,  "Salva",       "Salva la situazione corrente");
	saveMe.addButton("bttLoad",     "load()",     null,  "Carica",      "Riprendi una situazione salvata");
	saveMe.addButton("bttRestart",  "restart()",  null,  "Ricomincia",  "Ricomincia l'avventura");
	
	if (SW.options.get("showInfo") != "0") infoMenu();
	
	menu.draw();
	
	events.exec("ApplicationBegin");
	
	// initialize start Application
	callUserFunc("Inizia");
}

// Mostra pagina di informazioni, copyright e licenza di Idra

function infoIdra() {
  mostra(m_infoIdra, 'bgcolor="#ffffcc"')
}


// ===== Effetto del clic su una scelta =====================================

// Esegue l'azione act, che puo' essere:
// - una stringa da eseguire, ad esempio "vai(P1)"
// - una funzione (pagina) a cui andare, ad esempio P1

function esegui(act, args)
{
	act = scelte[act];
	if (typeof(act) == "function") { //se e' una funzione (pagina)
		vai(act, args);
	} else if (typeof(act) == "string") { //se e' una stringa
		eval(act);
	}
}


// ===== Salvataggio e ripristino ===========================================


// Verifica se puo' salvare, in caso affermativo esegue salva2()

function salva() {
  // verifica che non esista gia' una situazione salvata identica all'attuale
  var k = leggiSituazione() //eventuale situazione salvata
  if (k == null) { //nessuna situazione salvata, procede
    salva2()
  } else if (k == statoPrecedente) { //sono identiche, inutile salvare
    mostra(m_inutileSalvare)
  } else { //sono diverse, chiede conferma
    mostra(m_confermaSalva) // esegue salva2 se conferma, altrimenti ridisegna
  }
}


// Salva la situazione (prima dell'esecuzione della pagina) in un cookie

function salva2() {
  registraCookie(nomeCookie, statoPrecedente, durataCookie)
  if (leggiCookie(nomeCookie) == statoPrecedente) { //verifica se ha salvato
    situazioneSalvata = null //elimina eventuale situazione dalla variabile
    mostra(m_salvataCookie)
  } else {
    situazioneSalvata = statoPrecedente //non puo' usare i cookie, salva in una variabile
    mostra(m_salvataVar)
  }
}


// Chiede conferma se puo' riprendere la situazione salvata

function riprendi() {
  var s = leggiSituazione()
  if (s == null) {
    mostra(m_noSituazione)
  } else {
    mostra(m_confermaRiprendi)
  }
}


// Riprende la situazione salvata

function riprendi2() {
  var s = leggiSituazione()
  if (s) { //ricontrolla se ha riletto (tanto per sicurezza)
    ripristinaStato(s);
	// suoni e musica
	playstop();
	fx();
    aggiorna(); //avendo ripristinato lo statoPrecedente, ricostruisce quello attuale
  } else {
    mostra(m_noSituazione)
  }
}


// Rilegge la situazione salvata in un cookie o in una variabile

function leggiSituazione() {
  var s
  if (situazioneSalvata) { //se ha salvato in una variabile, rilegge
    s = situazioneSalvata
  } else { //altrimenti prova a rileggere dal cookie
    s = leggiCookie(nomeCookie)
  }
  return s
}


// Crea una stringa contenente lo stato di gioco, cioe la situazione corrente:
// le proprieta' di v, "qui" come stringa e lo stato del generatore pseudocasuale

function creaStringaStato() {
	v._qui_ = nomePagina(qui); //salva anche pagina corrente
	v._caso_ = caso.stato; //e stato del generatore pseudocasuale
	var s = "";
	for (var p in v) { //scandisce le proprieta' di v
		var pv = eval("v." + p); // valore contenuto
		if (typeof(pv) == "string") { //se e' una stringa e non un numero
			pv = '"' + pv.replace('"', '\"') + '"';
		}
		s = s + "v." + p + "=" + pv + ";"; //aggiunge al codice creato
	}
	return s;
}


// Rimette il gioco nello stato descritto dalla stringa s

function ripristinaStato(s) {
  eval(s) //riassegna le proprieta' di v
  qui = eval(v._qui_) //recupera la funzione della pagina corrente e la ridisegna
  caso.stato = v._caso_ //ripristina lo stato del generatore pseudocasuale
}


// ===== Funzioni ausiliarie per uso interno ================================


// Estrae un numero pseudocasuale fra 0 (incluso) e 1 (escluso),
// parte con un valore casuale se riceve un argomento;
// caso.stato contiene lo stato corrente, salvabile e ripristinabile

function caso() {
  if (!caso.stato) {
    caso.stato = (new Date()).getTime()
  }
  caso.stato = (caso.stato * 16807) % 2147483647
  return caso.stato / 2147483647.0
}


// Scrive nella pagina un messaggio dell'interprete
// (tit=titolo, txt=testo fra separatori)

function scriviMessaggio(tit, msg) {
  testo("&nbsp;<p><hr width=100%><br>")
  titolo(tit)
  testo(msg)
  testo("<p><hr width=100%>")
}


// Registra un cookie contenente i dati, con la durata specificata

function registraCookie(nome, dati, giorni) {
  var scade = new Date()
  scade.setTime(scade.getTime() + giorni * 1000 * 86400)
  var c = nome + "=" + escape(dati) +"; expires=" + scade.toGMTString()
  if (c.length <= 4095) {
    document.cookie = c
  } else {
    errore("il cookie e' troppo lungo (" + c.length + " byte, il massimo e' 4095)")
  }
}


// Legge un cookie, ritorna i dati o null se non lo trova

function leggiCookie(nome) {
  var dati = null
  var ck = document.cookie
  var id = nome + "="
  var p = ck.indexOf(id, 0) //cerca cookie con quel nome
  if (p != -1) { //se lo ha trovato
    p += id.length //salta nome e '='
    var sep = ck.indexOf(";", p) //cerca il separatore a fine dati
    if (sep == -1) { sep = ck.length }
    dati = unescape(ck.substring(p, sep))
  }
  return dati
}


// ##########################################################################
// ##  Messaggi standard                                                   ##
// ##########################################################################


function m_infoIdra() {
  testo("<center>&nbsp;<br><i>Realizzato con</i>")
  testo('<h1><font color="#006600">Idra</font></h1>')
  testo("<i>(Ipertesto Dinamico per Racconti d'Avventura, v ", SW.version, ")</i><p>")
  testo("Idra &egrave; ", SW.copyright, "<p></center>")
  testo('<font size = "-1"><b>Idra</b> &egrave; <font color="#cc0000">free software</font>; &egrave; lecito redistribuirlo e/o modificarlo secondo i termini della GNU GPL (Licenza Pubblica Generica GNU) come &egrave; pubblicata dalla Free Software Foundation; o la versione 2 della licenza o (a propria scelta) una versione successiva.')
  testo(" Questo programma &egrave; distribuito nella speranza che sia utile, ma <b>senza alcuna garanzia</b>; senza neppure la garanzia implicita di <b>negoziabilit&agrave;</b> o di <b>applicabilit&agrave; per un particolare scopo</b>. Per ulteriori dettagli vedasi la licenza GNU GPL (Licenza Pubblica Generica GNU).")
  testo(' Qualora non aveste ricevuto una copia della licenza GNU GPL insieme a questo programma, la potete richiedere alla Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA. La pagina Web della GNU &egrave; a <a href="http://www.gnu.org">www.gnu.org</a> (attenzione: facendo clic sui link si esce dal gioco).')
  testo('<p>L&#39;autore &egrave; contattabile a <a href="mailto:erix@mclink.it">erix@mclink.it</a>; il manuale di Idra, eventuali aggiornamenti, correzioni o altre informazioni sono disponibili alla pagina <a href="http://www.cityline.it/personal/erix/idra.html">www.cityline.it/personal/erix/idra.html</a>; non &egrave; ovviamente possibile garantire che questi indirizzi rimangano validi in futuro.')
testo("</font><p>")
testo("La licenza GNU GPL si applica esclusivamente a Idra e alle sue estensioni, anche se fisicamente residenti in altri file; <b>non si applica</b> al contenuto letterario o artistico delle opere realizzate con Idra, per il quale valgono le condizioni di copyright e di licenza stabilite dal relativo autore.")
  testo("<p><center>")
  rinvio("Continua", "ridisegna()")
  testo("</center>")
}

function m_inutileSalvare() {
  scriviMessaggio("Inutile salvare", "La situazione salvata &egrave; identica a quella attuale, non c'&egrave; bisogno di salvare.")
  continua("ridisegna()")
}

function m_confermaSalva() {
  scriviMessaggio("Sovrascrivo?", "Esiste gi&agrave; una situazione registrata, la devo sostituire con quella corrente?")
  scelta("S&igrave;, registraci sopra", "salva2()")
  scelta("No, non registrare", "ridisegna()")
}

function m_salvataCookie() {
  scriviMessaggio("Salvataggio riuscito", "La situazione &egrave; stata registrata su disco in un &quot;cookie&quot;.<p>Sar&agrave; rileggibile per " + durataCookie + " giorni, a meno che non venga eliminata prima dal browser per eccessivo affollamento.")
  continua("ridisegna()")
}

function m_salvataVar() {
  scriviMessaggio("Impossibile salvare su disco", "Non &egrave; stato possibile registrare un &quot;cookie&quot; su disco.<p>La situazione &egrave; stata salvata invece in memoria e sar&agrave; rileggibile solo finch&eacute; non uscirai dal gioco.")
  continua("ridisegna()")
}

function m_noSituazione() {
  scriviMessaggio("Impossibile riprendere la situazione", "Non c'&egrave; alcuna sitazione salvata in precedenza.<p>Se ce n'era una in un &quot;cookie&quot; pu&ograve; darsi che esso sia stato cancellato dal browser per eccessivo affollamento.")
  continua("ridisegna()")
}

function m_confermaRiprendi() {
  scriviMessaggio("Abbandono e riprendo?", "Abbandono la situazione corrente e riparto da quella registrata in precedenza?")
  scelta("S&igrave;, riprendi quella registrata", "riprendi2()")
  scelta("No, torna al gioco", "ridisegna()")
}


// Date alcune frasi (o comunque stringhe) ne restituisce una a caso

function FraseCasuale() {
	var num = dado(arguments.length);
	return arguments[num];
}

// Eventi casuali

function Eventi() {
	var eTesto;
	if (dado(100) <= eventi.probabilita) {
		eTesto = eventi.frasi[dado(eventi.frasi.length)];
		testoNlCSS("evidFrase", eTesto);
	}
}

/*
 *    Generic
 */

function repeat(str, num) {
	var out = "";
	while (num > 0) {
		out  += str;
		num--;
	}
	return out;
}
