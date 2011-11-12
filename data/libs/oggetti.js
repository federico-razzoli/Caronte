// Estensioni oggetti e inventario per Idra
// (C) 2000 Enrico Colombini
// Free software sotto la licenza GNU GPL

// Realizzato su suggerimento di Tommaso Percivale con un'interfaccia simile a
// quella del sistema ILES (Interactive Literature Editing System) creato da 
// Alberto Morena e Tommaso Percivale e impiegato nei libri gioco chiamati "IperLibri"

// Questo file estende Idra: le parti di programmazione HTML 
// e JavaScript qui contenute sono soggette alla medesima licenza GNU GPL
// di Idra stesso, vedi i file idra.js e Licenza.html per i dettagli.


// ===== Informazioni su Oggetti Idra =======================================


var oggIdra = new Object() // unica variabile globale aggiunta
oggIdra.versione = "1.0"
oggIdra.data = "Dicembre 2000"
oggIdra.copyright = "&copy; 2000 Enrico Colombini"


// ===== Box  ==========================================================

var boxOggetti = gui.createArea("boxOggetti", "box", "Inventario", true, 25);
gui.draw();
boxOggetti.setCSSProperty('#DDDDDD', 'backgroundColor');


// ===== Variabili ==========================================================


oggIdra.selez = "" //nessun oggetto attualmente selezionato
oggIdra.datiOgg = "" // conterra' l'array con la lista di oggetti e descrizioni
oggIdra.scelte = new Array() //ogni elemento conterra' una tavola di scelte
oggIdra.nscelte = 0 //non usa nscelte di Idra per pulizia del codice
oggIdra.preRinvio = "" //per evidenziare i rinvii su cui si puo' agire con oggetti
oggIdra.postRinvio = ""


// ##########################################################################
// ##  Inizio area funzioni chiamabili dall'autore                         ##
// ##########################################################################


// Definisce gli oggetti: deve passare un array contenente, alternati,
// il nome della variabile di oggetto (senza .v) e la descrizione da mostrare;
// usa un array invece di un hash table per mantenere l'ordine dell'autore

function definisciOggetti(elenco) {
	oggIdra.datiOgg = elenco;
}


// Imposta opzioni per evidenziare i rinvii su cui agire con gli oggetti

function opzioniRinvioOgg(pre, post) {
	oggIdra.preRinvio = pre;
	oggIdra.postRinvio = post;
}


// Ritorna il nome dell'oggetto selezionato, corrispondente al nome della
// variabile che lo controlla, senza la v. iniziale

function ogg() {
	return oggIdra.selez;
}


// Scrive testo dell'area oggetti, inclusi eventuali comandi HTML,
// accetta un numero variabile di argomenti e li stampa di seguito

function testoOggetti() {
	for (var i = 0; i < arguments.length; i++) {
		boxOggetti.write(arguments[i], "boxOggetti");
	}
	boxOggetti.send();
}


// Scrive/aggiorna area oggetti, selezionando l'oggetto ogg, se indicato;
// per deselezionare passare un nome non valido, ad esempio "";
// per descrivere l'oggetto chiama la funzione utente DescriviOggetto,
// se esiste, passando il nome, la descrizione e se l'oggetto e' selezionato

function mostraOggetti(ogg) {
	// select/unselect object
	if (oggIdra.selez == ogg)
		oggIdra.selez = "";
	else
		oggIdra.selez = ogg;
	// creare finestra
	for (var i = 0; i < oggIdra.datiOgg.length;  i += 2) { //scandisce possibili oggetti
		var ogg = oggIdra.datiOgg[i]; //variabile corrispondente all'oggetto
		if (eval("v." + ogg) > 0) {
			//mostra se la variabile corrispondente e' positiva
			var desc = oggIdra.datiOgg[i + 1]; //descrizione oggetto da mostrare
			// separator
			if (i > 0) {
				boxOggetti.write(repeat("&nbsp;", 5))
			}
			boxOggetti.write("<a href=javascript:mostraOggetti(" + '"' + ogg + '"' + ")");
			boxOggetti.write(" onMouseOver='return true'>");
			var selez = (ogg == oggIdra.selez); //vera se l'oggetto e' selezionato
			if (window.DescriviOggetto) {
				//chiama funzione utente per scrivere o disegnare
				DescriviOggetto(ogg, desc, selez);
			} else {
				//default: usa <b> per evidenziare oggetto selezionato
				if (selez) {
					boxOggetti.write("<b>" + desc + "</b>");
				} else {
					boxOggetti.write(desc);
				}
			}
			boxOggetti.write("</a>");
		}
	}
	boxOggetti.send();
	oggIdra.nscelte = 0; //azzera contatore di identificazione per rinvioOgg
}


// Aggiunge, nel testo della pagina, un rinvio dipendente dall'oggetto selezionato;
// la lista degli argomenti va letta come (defaultAct, ogg1, act1, ogg2, act2, ...) 
// l'oggetto "+" indica tutti gli oggetti non esplicitamente indicati, l'azione
// corrispondente verra' eseguita se c'e' un oggetto selezionato, ma non e' in lista

function rinvioOgg(desc, defaultAct) { //seguono argomenti opzionali, vedi sopra
  var tavola = new Object() //hash table con coppie oggetto-azione
  tavola["-"] = defaultAct
  for (var i = 1; i < arguments.length; i++) {
    tavola[arguments[i]] = arguments[i + 1]
  }
  //crea un rinvio che chiamera' eseguiRinvioOgg('indice')
  rinvio(oggIdra.preRinvio + desc + oggIdra.postRinvio, "eseguiRinvioOgg('" + oggIdra.nscelte + "')")
  oggIdra.scelte[oggIdra.nscelte] = tavola //associa l'intera hash table all'azione
  oggIdra.nscelte++
}


// Identica a rinvioOgg, ma mostra l'opzione come una scelta

function sceltaOgg(desc, defaultAct) { //seguono argomenti opzionali, vedi sopra
  var tavola = new Object() //hash table con coppie oggetto-azione
  tavola["-"] = defaultAct
  for (var i = 1; i < arguments.length; i++) {
    tavola[arguments[i]] = arguments[i + 1]
  }
  //crea un rinvio che chiamera' eseguiRinvioOgg('indice')
  //rinvio(oggIdra.preRinvio + desc + oggIdra.postRinvio, "eseguiRinvioOgg('" + oggIdra.nscelte + "')")
  scelta(oggIdra.preRinvio + desc + oggIdra.postRinvio, "eseguiRinvioOgg('" + oggIdra.nscelte + "')")
  oggIdra.scelte[oggIdra.nscelte] = tavola //associa l'intera hash table all'azione
  oggIdra.nscelte++
}


// ##########################################################################
// ##  Fine area funzioni chiamabili dall'autore                           ##
// ##########################################################################


// Effetto del clic su un rinvioOgg (rimandato da Idra): esegue l'azione associata 
// all'oggetto correntemente selezionato se c'e', altrimenti quella di default

function eseguiRinvioOgg(indice) {
  var lista = oggIdra.scelte[indice]
  var act = null //azione da eseguire
  if (oggIdra.selez) { //se c'e' un oggetto selezionato
    act = lista[oggIdra.selez] //sceglie l'azione corrispondente
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
