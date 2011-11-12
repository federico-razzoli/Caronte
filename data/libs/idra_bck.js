// Idra: Ipertesto Dinamico per Racconti d'Avventura
// (C) 2000 Enrico Colombini
// Idra e' free software sotto la licenza GNU GPL, vedi infoIdra() per dettagli


// ===== Informazioni su Idra ===============================================


var idra = new Object()
idra.versione = "1.0"
idra.data = "Febbraio 2000"
idra.copyright = "&copy; 2000 Enrico Colombini"


// ===== Variabili ==========================================================


var scelte = new Array() //scelte valide (stringhe contenenti codice o funzioni)
var nscelte = 0
var qui = null //pagina corrente
var statoPrecedente = null //situazione prima dell'esecuzione della pagina corrente
var situazioneSalvata = null //usata per salvare se non funzionano i cookie
var idPagina = 0 //identificatore univoco (progressivo) di pagina
var nomeCookie = "Dati" //per il salvataggio su disco
var durataCookie = 365 //giorni
var mostraDebugger = 0
var comandoDebug = "" //ultimo comando dato al debugger
var percorso = ""  // usato per i labirinti

// a disposizione dell'autore:

var v = new Object() //contiene le variabili di gioco come proprieta'


// Eventi

var eventi = new Object;
    eventi.frasi        = new array();  // array di frasi che si alternano
	eventi.probabilita  = 5;            // probabilità che una frase sia visualizzata


// ##########################################################################
// ##  Inizio area funzioni chiamabili dall'autore                         ##
// ##########################################################################


// ===== Funzioni di cambio pagina ==========================================


// Va alla pagina pag, che viene ricordata nella variabile qui
// come pagina corrente, usa OpzioniPagina(pag) se esiste, chiama:
// Intestazione(pag) se esiste, pag(), PiePagina(pag) se esiste,
// mostra le informazioni di debug se mostraDebugger = 1,
// prima di mostrare la pagina salva la situazione in statoPrecedente

function vai(pag) {
  qui = pag // ricorda la pagina
  statoPrecedente = creaStringaStato() //situazione prima di eseguire la pagina
  if (window.OpzioniPagina)  {
    apriPagina(OpzioniPagina(pag))
  } else {
    apriPagina()
  }
  if (window.Intestazione) { Intestazione(pag) }
  pag() //scrive la pagina
  if (window.PiePagina) { PiePagina(pag) }
  if (mostraDebugger) { infoDebug() }
  chiudiPagina()
  // se in modo debugging, seleziona il relativo campo di input
  if (mostraDebugger) { selDebugInput() }
}


// Mostra la pagina pag, senza ricordarla nella variabile qui; non chiama
// ne' Intestazione() ne' PiePagina() ma solo pag(), eventuali opzioni
// vanno esplicitamente passate come argomento (lo si puo' tralasciare)

function mostra(pag, opzioni) {
  apriPagina(opzioni)
  pag() //scrive la pagina
  chiudiPagina()
}


// Esegue nuovamente la pagina corrente, cioe' quella ricordata nella variabile qui

function aggiorna() {
  vai(qui)
}


// Ridisegna la pagina corrente (qui) senza eseguirla, in modo che non cambi lo stato,
// lo fa partendo dallo stato precedente all'esecuzione e poi eseguendola

function ridisegna() {
  ripristinaStato(statoPrecedente)
  aggiorna() //avendo ripristinato lo statoPrecedente, ricostruisce quello attuale
}


// ===== Funzioni di creazione pagina =======================================


// Scrive l'eventuale titolo della pagina

function titolo(tit) { // modificato da federico razzoli
  testo('<h2>' + tit + "</h2>")
}


// Scrive (parte del) testo della pagina, inclusi eventuali comandi HTML,
// accetta un numero variabile di argomenti e li stampa di seguito

function testo() {
  for (var i = 0; i < arguments.length; i++) {
    parent.area.document.write(arguments[i])
  }
}

// Come testo(), ma dopo ogni parametro scrive un a capo (<br>);
// il tutto inoltre è incluso nei tag <p>...</p>
// Utile per non scrivere i tag manualmente
function testoNl(testo) {  // federico razzoli
  parent.area.document.write("\n<p>\n");
  for (var i = 0; i < arguments.length; i++) {
    parent.area.document.write(arguments[i] + "<br>\n")
  }
  parent.area.document.write("\n</p>\n");
}


// Come testo(), ma dopo ogni parametro scrive un a capo (<br>);
// Come testo(), ma dopo ogni parametro scrive un a capo (<br>);
// il tutto inoltre è incluso nei tag <p>...</p>
// classeCSS, se non è vuoto/null, è lo stile CSS (attributo HTML class)
// Utile per non scrivere i tag manualmente
function testoNlCSS(classeCSS, testo) {  // federico razzoli
  if (classeCSS) parent.area.document.write("\n<p class=\"" + classeCSS + "\">\n");
  else parent.area.document.write("\n<p>\n");
  for (var i = 1; i < arguments.length; i++) {
    parent.area.document.write(arguments[i] + "<br>\n")
  }
  parent.area.document.write("\n</p>\n");
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
    testo("</ul>")
  }
} 


// Aggiunge una scelta nel testo, ricorda l'azione in scelte[], il link e'
// preceduto da idPagina per evitare problemi con la navigazione del browser

function rinvio(desc, act) {
  //associa al link una chiamata a eseguiScelta('idPagina:scelta')
  testo("<a href=javascript:parent.ctrl.eseguiScelta('", idPagina, ":", nscelte, "')")
  testo(" onMouseOver='return true'>", desc, "</a>")
  scelte[nscelte] = act
  nscelte++
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


// Crea una nuova pagina con eventuali opzioni del <body> (es. colore), 
// assegna un identificatore univoco per rilevare problemi causati dai comandi 
// di navigazione del browser, azzera il contatore delle scelte
// stylesheet, se presente, è il nome del file senza estensione (.css)
// se non è presente si usa v.defaultCSS (se esiste)

function apriPagina(opzioni, stylesheet) {  // exix, federico razzoli
  var doc = parent.area.document
  if (stylesheet)
	stylesheet = '<link rel="StyleSheet" href="' + stylesheet + '.css" type="text/css" media="screen">';
  else if (v.defaultCSS)
	stylesheet = '<link rel="StyleSheet" href="' + v.defaultCSS + '.css" type="text/css" media="screen">';
  else
	stylesheet = '';
  doc.open()
  doc.write('<html><head>' + stylesheet + '</head><body ')
  if (opzioni) { doc.write(opzioni) }
  doc.write(' >')
  idPagina++ //assegna un ID univoco
  nscelte = 0 // reset contatore scelte
}


// Termina la scrittura di una pagina

function chiudiPagina() {
  var doc = parent.area.document
  doc.write("</body></html>")
  doc.close()
}


// ===== Funzioni ausiliarie ================================================


// Imposta opzioni per il salvataggio su disco

function opzioniCookie(nome, giorni) {
  nomeCookie = nome
  durataCookie = giorni
}


// Ritorna la pagina corrente (evita accesso diretto alle variabili del programma)

function pagina() {
  return qui
}


// Ritorna il nome di una pagina (funzione)

function nomePagina(p) {
  var s = p.toString() //lista la funzione corrispondente alla pagina
  // salta "function" e uno spazio, tiene fino alla parentesi esclusa
  return levaSpaziAttorno(s.substring(9, s.indexOf("(", 0)))
}


// Tira un dado a n facce (6 se non indicate), ritorna un intero tra 1 e n
/*
function dado(n) {
  if (! n) { n = 6 } // default: 6 facce
  return Math.ceil(n * caso()) //non usare random(), dev'essere ripristinabile
}
*/
function dado(n) {
  var num;
  if (! n) { n = 6 } // default: 6 facce
  return Math.floor(Math.random() * (n + 1));
}

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


// Inizia il gioco

function gioca() {
  window.onerror = errore //attiva error handler
  qui = null //non e' aperta nessuna pagina
  v = new Object() //rialloca per evitare dati 'dimenticati' se riparte
  Inizia() //azzera variabili e va alla prima pagina
}


// Riparte dall'inizio

function riparti() {
  mostra(m_confermaRiparti) //se accetta, chiamera' gioca()
}


// Mostra pagina di informazioni, copyright e licenza di Idra

function infoIdra() {
  mostra(m_infoIdra, 'bgcolor="#ffffcc"')
}


// ===== Effetto del clic su una scelta =====================================


// Verifica id di pagina per evitare problemi con Indietro e Avanti del browser,
// poi esegue l'azione contenuta nella scelta n, vedi esegui()

function eseguiScelta(s) {
  //riceve una stringa nel formato "id:scelta"
  var p = s.indexOf(":") //separa id di pagina e numero della scelta
  var id = s.substring(0, p)
  var n = s.substring(p + 1, s.length)
  if (id != idPagina) { //controlla che la pagina non sia cambiata
    mostra(m_cambiataPagina) //se lo e', avverte e poi rimette quelle giusta
  } else {
    esegui(scelte[n])
  }
}


// Esegue l'azione act, che puo' essere:
// - una stringa da eseguire, ad esempio "vai(P1)"
// - una funzione (pagina) a cui andare, ad esempio P1

function esegui(act) {
  if (typeof(act) == "function") { //se e' una funzione (pagina)
    vai(act)
  } else if (typeof(act) == "string") { //se e' una stringa
    eval(act)
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
    ripristinaStato(s)
    aggiorna() //avendo ripristinato lo statoPrecedente, ricostruisce quello attuale
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
  v._qui_ = nomePagina(qui) //salva anche pagina corrente
  v._caso_ = caso.stato //e stato del generatore pseudocasuale
  var s = ""
  for (var p in v) { //scandisce le proprieta' di v
    var pv = eval("v." + p) // valore contenuto
    if (typeof(pv) == "string") { //se e' una stringa e non un numero
      pv = '"' + segnaVirgolette(pv) + '"' //tra virgolette e con \" se necessari
    }
    s = s + "v." + p + "=" + pv + ";" //aggiunge al codice creato
  }
  return s
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

function caso(iniz) {
  if (iniz) {
    caso.stato = (new Date()).getTime()
  }
  caso.stato = (caso.stato * 16807) % 2147483647
  return caso.stato / 2147483647.0
}
caso(1) //inizializza quando il programma viene caricato


// Scrive nella pagina un messaggio dell'interprete
// (tit=titolo, txt=testo fra separatori)

function scriviMessaggio(tit, msg) {
  testo("&nbsp;<p><hr width=100%><br>")
  titolo(tit)
  testo(msg)
  testo("<p><hr width=100%>")
}


// Mostra una finestra di dialogo con un messaggio di errore,
// usata sia per l'error handler (3 arg) che come funzione generica (1 arg)

function errore(err, url, linea) {
  var s = "Errore: " + err
  if (url) { s = s + "\nURL = " + url } 
  if (linea) { s = s + "\nLinea = " + linea }
  alert(s)
  return true //non mostrare messaggio di errore del browser
} 


// Converte eventuali virgolette " contenute nella stringa s in \"

function segnaVirgolette(s) {
  var sv = ""
  var p
  while ((p = s.indexOf('"', 0)) != -1) { //se trova virgolette
    sv = sv + s.substring(0, p) + '\\' + '"' //aggiunge alla parte lavorata
    s = s.substring(p + 1, s.length) //toglie dalla parte restante
  }
  sv += s
  return sv
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
  testo("<i>(Ipertesto Dinamico per Racconti d'Avventura, v ", idra.versione, ")</i><p>")
  testo("Idra &egrave; ", idra.copyright, "<p></center>")
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

function m_confermaRiparti() {
  scriviMessaggio("Ricomincio?", "Abbandono la situazione corrente e ricomincio il gioco dall'inizio?")
  scelta("S&igrave;, ricomincia dall'inizio", "gioca()")
  scelta("No, torna al gioco", "ridisegna()")
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

function m_cambiataPagina() {
  scriviMessaggio('<font color="#cc0000">Problema: pagina errata</font>', "Il programma &egrave; confuso: probabilmente sei tornato indietro usando i comandi del browser invece che fare clic su una delle scelte elencate nella finestra.<p>Ora cerco di rimettere le cose a posto in modo che il gioco possa continuare.")
  continua("ridisegna()")
}


// ##########################################################################
// ##  Debugger                                                            ##
// ##########################################################################


// Mostra e nasconde le informazioni di debugging

function alternaDebugger() {
  mostraDebugger = ! mostraDebugger
  ridisegna();
}


// Mostra la pagina corrente, i valori delle variabili v., un campo di input
// per inserire comandi (o un nome di pagina) e il contenuto delle varie scelte;
// non vengono mostrate le variabili speciali che iniziano con un sottolineato

function infoDebug() {
  testo('<hr width="100%">')
  testo('<font size="-1">')
  testo("pagina=", nomePagina(qui)) //mostra nome della pagina corrente
  for (var p in v) { //elenca le proprieta' di v
    var pv = eval("v." + p) //valore contenuto
    if (typeof(pv) == "string") {
      pv = '"' + segnaVirgolette(pv) + '"' //tra virgolette e con \" se necessari
    }
    if (! (p.charAt(0) == "_")) { //salta variabili speciali
      testo(", v.", p, "=", pv)
    }
  }
  // crea campo di input e pulsante (= tasto Enter) per NS (4.5) e IE (5.0)
  testo('<form name="debugForm" onSubmit="parent.ctrl.eseguiDebug(); return false">')
  testo('<input type="text" name="debugInput"> ')
  testo('<input type="button" value="Esegui" onClick="parent.ctrl.eseguiDebug()"> ')
  testo('<input type="button" value="Aggiorna" onClick="parent.ctrl.aggiornaDebug()"> ')
  testo('<input type="button" value="Richiama" onClick="parent.ctrl.richiamaDebug()">')
  testo('<br></form>')
  // elenca le azioni associate alle scelte mostrate nella pagina
  var act
  for (var i = 0; i < nscelte; i++) {
    testo("Scelta ", (i + 1), ": &nbsp;")
    act = scelte[i]
    if (typeof(act) == "function") { //se e' una funzione (pagina)
      testo(nomePagina(act))
    } else if (typeof(act) == "string") { //se e' una stringa
      testo(act)
    }
    testo("<br>")
  }
  testo("</font>")
}


// Mette il cursore sul campo di input del debugger

function selDebugInput() {
  parent.area.focus() //per netscape
  parent.area.document.debugForm.debugInput.focus()
}


// Esegue il comando impostato nel debugger, ridisegna la pagina;
// se il comando e' una singola parola composta da [A-Za-z0-9_]
// lo considera una pagina e ci va,  altrimenti lo considera codice e lo esegue

// Fase preliminare, necessaria altrimenti IE 5.0 ogni tanto si pianta

function eseguiDebug() {
  setTimeout("eseguiDebug2()", 50)
}

// Successiva fase di esecuzione

function eseguiDebug2() {
  // legge comando in input
  var com = levaSpaziAttorno(parent.area.document.debugForm.debugInput.value)
  if (com) {
    comandoDebug = com //ne tiene una copia per poterlo richiamare
    if (contieneSolo(com.toLowerCase(), "abcdefghijklmnopqrstuvwxyz0123456789_")) {
      vai(eval(com)) //va alla nuova pagina
    } else {
      esegui(com) //esegue codice JavaScript e riesegue la pagina
      aggiorna()
    }
  }
}


// Aggiorna la pagina corrente, anche questo in due fasi per evitare problemi con IE

function aggiornaDebug() {
  setTimeout("aggiornaDebug2()", 50)
}

function aggiornaDebug2() {
  aggiorna()
}


// Richiama l'ultimo comando dato al debugger

function richiamaDebug() {
  parent.area.document.debugForm.debugInput.value = comandoDebug
  selDebugInput() //rimette il cursore sul campo di input
}


// Controlla se la stringa s contiene solo i caratteri indicati nella stringa validi

function contieneSolo(s, validi) {
  var ok = 1
  for (var i = 0; i < s.length; i++) {
    if (validi.indexOf(s.charAt(i)) == -1) { //se non lo trova, non e' valido
      ok = 0 //carattere non valido
    }
  }
  return ok
}


// Date alcune frasi (o comunque stringhe) ne restituisce una a caso

function FraseCasuale() {
	var num = dado(arguments.length) - 1;
	return arguments[num];
}


// Eventi casuali

function Eventi() {
	var testo;
	if (dado(100) <= eventi.probabilita) {
		testo = eventi.frasi[dado(eventi.frasi.length)];
		testoNlCSS("evidFrase", testo);
	}
}


// luogo:         titolo
// descrizione:   il testo da presentare
// destinazione:  la stanza dove si va quando si esce
// direzione:     l'ultima direzione seguita
// soluzione:     il percorso da seguire
function Labirinto() {
	//apriPagina();
	if (v.labirinto.percorso.length < v.labirinto.soluzione.length) {
		// la soluzione non può essere ancora stata trovata.
		// ci limitiamo a regisrare l'ultima direzione seguita.
		v.labirinto.percorso = v.labirinto.percorso + v.labirinto.direzione;
		titolo(v.labirinto.titolo);
		testo(v.labirinto.testo);
		if (v.labirinto.eventi) Eventi();
		scelta("Nord",   "v.labirinto.direzione='n'; vai('Labirinto')");
		scelta("Est",    "v.labirinto.direzione='e'; vai('Labirinto')");
		scelta("Sud",    "v.labirinto.direzione='s'; vai('Labirinto')");
		scelta("Ovest",  "v.labirinto.direzione='o'; vai('Labirinto')");
	} else {
		// aggiorniamo il percorso
		v.labirinto.percorso = v.labirinto.percorso.substring(1) + v.labirinto.direzione;
		// controlliamo la soluzione
		if (v.labirinto.percorso == v.labirinto.soluzione) {
			vai(v.labirinto.destinazione);
		} else {
			titolo(v.labirinto.titolo);
			testo(v.labirinto.testo);
			if (v.labirinto.eventi) Eventi();
			scelta("Nord",   "v.labirinto.direzione='n'; vai('Labirinto')");
			scelta("Est",    "v.labirinto.direzione='e'; vai('Labirinto')");
			scelta("Sud",    "v.labirinto.direzione='s'; vai('Labirinto')");
			scelta("Ovest",  "v.labirinto.direzione='o'; vai('Labirinto')");
		}
	}
	//chiudiPagina();
}

/*

ChangeLog

* Aggiunti testoNl(), testoNlCSS()
* Aggiunto parametro stylesheet ad apriPagina()
* Aggiunta FraseCasuale()
* Sostituita dado()
* Aggiunti oggetto eventi e funzione Eventi()
* Aggiunti oggetto labitinto e funzione Labirinto()

*/

