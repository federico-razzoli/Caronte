/*
	(C) 2011 Federico Razzoli
	
	La presente opera è distribuita secondo i termini della licenza
	Creative Commons Attribution-NonCommercial 3.0 Unported:
	http://creativecommons.org/licenses/by-nc/3.0/us/
*/

// Inizia una nuova lettura: azzera le variabili di gioco e va alla prima pagina

function Inizia() {
	// azioni
	v.spostato     = 0;  // no spada, no uscito da sala torture
	v.vecchietta   = 0;
	v.portaAperta  = 0;
	
	eventi.frasi = new Array(
			"Un alito di vento gelido ti entra fin nelle ossa.",
			"Qualcosa di viscido ti sfiora, facendoti rabbrividire; ma per fortuna è solo un verme.",
			"Un pipistrello arriva volando da chissà dove, ti graffia la testa e se ne va.",
			"Ti sembra di sentire un lamento, da qualche parte.",
			"Una donna impiccata appare davanti a te; urli terrorizzato, quand'ecco che lei si muove! E indica, in preda al panico, qualcosa dietro di te!! Ti volti e... non c'è niente. Anche la donna è sparita.",
			"Senti uno scricchiolio e non capisci da dove venga.",
			"Un rumore improvviso ti fa voltare... è solo un topo. Lo afferri e te lo mangi.",
			"Ti cade un occhio. Per fortuna riesci a risistemarlo al suo posto.",
			"Ti senti osservato.",
			"Hai l'impressione di non essere solo."
		);
	eventi.probabilita = 5;
	
	// oggetti
	v.chiaveRossa  = 0;
	v.spada        = 0;
	v.spillone     = 0;
	v.torcia       = 0;
	
	plugins.get("extObjects").definisciOggetti(new Array(
		"chiaveRossa",  "Chiave rossa",
		"spada",        "Spada antica",
		"spiedino",     "Spiedino di dita",
		"spillone",     "Spillone",
		"torcia",       "Torcia"
	));
	// inizio
	vai(Introduzione);
}

function Intestazione(pag)
{
  testo("<h1 id=\"mainTitle\">" + info.title + "</h1>");
}

function PiePagina(pag) {  }


// === Pagine del racconto ==================================================


// Visualizza un messaggio e il link per tornare alla pagina precedente
// Non può chiamare messaggio()
function Inutile()
{
	var txt = "";
	var num = dado(3);
	if      (num == 1) txt = "E' tutto inutile.";
	else if (num == 2) txt = "Qualunque cosa tu stia cercando di fare... non ci riesci.";
	else if (num == 3) txt = "Fare una cosa simile non ti servirebbe a nulla.";
	messaggio(txt);
}

function Spiegazione() {
  titolo("Una piccola spiegazione")
  testoNl("Va tutto bene, niente panico!",
		"Questo gioco è ambientato nel mondo di Life Of The Dead.",
		"Gli zombi hanno invaso il mondo, le città sono in rovina e i vivi per rimanere tali devono difendersi dagli assalti degli zombi (e va bene, lo ammetto, quando ho detto che andava tutto bene ho mentito!).",
		"Torturina è una zombina dolce e graziosa, che ha il vizietto di ammazzare la gente (vivi o morti) fra atroci sofferenze.",
		"Tu, per tua sfortuna, sei capitato fra le sue grinfie. Ma ora lei non c'è. Probabilmente ti ha ucciso e poi ti ha lasciato dov'eri, senza pensare al fatto che ti saresti risvegliato come zombi.",
		"A proposito, la maggioranza della gente appena morta è senza cervello e non fa altro che sbavare e mangiare il prossimo. Tu sembri avere il dono dell'intelligenza... ritieniti molto fortunato. Soprattutto se riuscirai a scappare da Torturina.",
		"",
		"Cliccando sui link che vedi nel testo, puoi eseguire azioni o prendere oggetti. Gli oggetti che prenderai appariranno nell'inventario. Cliccando su un oggetto dell'inventario e poi su un link nel testo, potrai eseguire un'azione usando l'oggetto selezionato."
	);
  testo("<p>Life Of The Dead è qui: <strong><a href=\"http://blogofthedead.blogs.it/\">blogofthedead.blogs.it</a></strong></p>");
  continua(Introduzione);
}

function Introduzione()
{
	//suono("intro.wav");
	titolo("Un terribile risveglio");
	testoNl(
		"Ti svegli in una stanza buia.",
		"La testa ti duole. Non solo quella per la verità, ma anche il collo e le braccia.",
		"Il resto del corpo non lo senti più.",
		"Ehi, un momento... non lo senti perchè non c'è! Hai solo la testa e le braccia! Come può essere?..",
		"Rifletti e capisci: sei morto.",
		"Ora sei uno zombo... sei uno di quei maledetti cadaveri cannibali che appestano il tuo mondo!",
		"",
		"L'ultima cosa che ricordi è che ieri sera stavi passeggiando nella zona del cimitero per sgranchirti le gambe. " +
		"Hai visto una bambina graziosa, con le treccine, i fiocchetti rosa e una bellissima gonnellina. Ti ha chiesto se volevi giocare con lei, e tu stupidamente hai acconsentito... ma quella bambina era morta! ",
		"Era una zomba!" ,
		"Si è presentata come <span class=\"evidParola\">Torturina</span>. Ti ha tramortito, e quando ti sei svegliato eri in questa stanza. ",
		"Ricordi che, appena hai aperto gli occhi, ti ha trafitto con degli spilloni roventi... poi, più niente."
	);
	scelta("Continua", SalaTorture);
	scelta("Dove diavolo sono!? + Istruzioni", Spiegazione);
}

function SalaTorture()
{
  titolo("La sala delle torture");
  testo("<p>Sei in una sala grande e umida.<br>",
		"Le pareti e il pavimento sono intagliate rozzamente nella pietra.<br>",
		"Vedi un tavolo da tortura lordo di sangue, un mucchio di ossa e "
	);
  plugins.get("extObjects").rinvioOgg("una bara", Bara,
		"torcia", "if (v.spostato < 2) vai(DeathScheletro); else Inutile();",
		"+", "Inutile()"
	);
  testo(".<br>",
		"Vedi una porticina a sud e un corridoio a nord.</p>"
	)
  if (!v.torcia) {
	  testo("<p>Su di una parete vedi ");
	  plugins.get("extObjects").rinvioOgg(
			"una torcia", "v.torcia=1; aggiorna()",
			"spada", "messaggio(\"Fare a pezzi la torcia non sarebbe una buona idea.\")",
			"spillone", "messaggio(\"Arroventi lo spillone e te lo ficchi in un occhio. Ahhhh, che bello!\")",
			"+", "Inutile"
		);
	  testo(".</p>");
  }
  Eventi();
  scelta("Entra nella porticina", SgabuzzinoDita)
  scelta("Vai nel corridoio", CorridoioSotterraneo)
}

function Scheletro() {
  titolo("La bara")
  testoNl("E' uno scheletro ben conservato e pulito. E' vestito da soldato nordista.",
		"Si trovano strane cose, in questo posto...",
		"(ovunque sia, questo posto)."
	);
  continua(SalaTorture);
}

function Bara() {
  titolo("La bara");
  testo("<p>Ti avvicini alla bara e la apri.<br>");
  if (!v.spostato) {
	testo("Dentro c'è uno ");
	plugins.get("extObjects").rinvioOgg(
			"scheletro", "vai(Scheletro)",
			"torcia", "messaggio(\"Vuoi piantarla di fare il piromane?!\")",
			"spada", "messaggio(\"Gliela renderai più tardi.\")",
			"spiedino", "messaggio(\"Lo scheletro non ha fame.\")",
			"+", "Inutile()"
			);
	testo(" con ");
	plugins.get("extObjects").rinvioOgg(
			"una spada", "v.spada=1; v.spostato=1; vai(SalaTorture);",
			"torcia", "messaggio(\"Arroventi la spada e te la infili nella carne. Ahhhh, che bello!\")",
			"+", "Inutile()"
		);
	testo(".</p>");
  } else if (v.spostato==2) {
	//suono("horror.mp3");
	testo("Lo scheletro non c'è più... <span class=\"evidParola\">dove diavolo è andato!?</span></p>");
	if (!(v.spillone || v.spiedino)) {
		testo("<p>Noti ");
		plugins.get("extObjects").rinvioOgg(
			"uno spillone", "v.spillone=1; aggiorna()",
			"torcia", "messaggio(\"Arroventi lo spillone e te lo ficchi in un occhio. Ahhhh, che bello!\")",
			"+", "Inutile()"
			);
		testo(" in un angolo della bara.</p>");
	}
  } else {
	testo("Lo ");
	plugins.get("extObjects").rinvioOgg(
			"scheletro", "vai(Scheletro)",
			"torcia", "messaggio(\"Vuoi piantarla di fare il piromane?!\")",
			"spada", "messaggio(\"Gliela renderai più tardi.\")",
			"spiedino", "messaggio(\"Lo scheletro non ha fame.\")",
			"+", "Inutile()"
			);
	testo(" è ancora al suo posto.</p>");
  }
  scelta("Allontanati dalla bara", SalaTorture);
}

function SgabuzzinoDita() {
  titolo("Lo sgabuzzino delle dita")
  if (!v.torcia) {
	testoNl("E' tutto buio... non vedi un accidente!");
	scelta("Continua nel buio", Buio);
	scelta("Torna alla sala delle torture", SalaTorture);
  } else {
	testo("<p>In questo stanzino vedi ");
	plugins.get("extObjects").rinvioOgg(
			"dita", Dita,
			"spillone", Spiedino,
			"torcia", DitaBrucia,
			"spada", DitaSpada,
			"+", "Inutile()"
		);
	testo(
			" di tutte le dimensioni, età e sessi.<br>",
			"Ma tutto sommato quelle che hai già non ti dispiacciono.<br>",
			"C'è un bottone rosso sul muro; sotto di esso c'è scritto con il sangue:<br>",
			"\"Si prega le vittime di premere qui\".<br>",
			"Sembrerebbe scritto da una bambina.</p>"
		);
	if (v.spostato==1) {
		v.spostato = 2;
		//suono("passi.mp3");
		testoNlCSS("evidFrase", "Senti dei passi provenienti dalla stanza delle torture.");
	} else Eventi();
	scelta("Premi il bottone rosso", PremiQui)
	scelta("Torna alla sala delle torture", SalaTorture)
  }
}

function Dita() {
  titolo("Una montagna di dita!");
  testoNl("Ti tuffi fra le dita e ti fai una bella nuotata!");
  scelta("Torna nello sgabuzzino", SgabuzzinoDita);
}

function DitaSpada() {
	//suono('splat.mp3');
	testoNl("Fai a pezzettini alcune dita.");
	continua(SgabuzzinoDita);
}

function DitaBrucia() {
	//suono('burn.mp3');
	testoNl("Ti diverti a carbonizzare alcune dita.");
	continua(SgabuzzinoDita);
}

function Spiedino() {
	//suono("spiedino.mp3");
	titolo("Lo sgabuzzino delle dita");
	testoNl("Infilzi le dita nello spillone, creando un appetitoso spiedino.");
	v.spillone = 0;
	v.spiedino = 1;
	scelta("Torna nello sgabuzzino", SgabuzzinoDita);
}

function CorridoioSotterraneo() {
  titolo("Il corridoio silenzioso")
  if (!v.torcia) {
	testoNl("E' tutto buio... non vedi un accidente!");
	scelta("Continua nel buio", Buio);
	scelta("Torna alla sala delle torture", SalaTorture);
  } else {
	testoNl(
			"Il corridoio è lungo e buio. Porta dalla sala delle torture a una porta nera. Le pareti sono incrostate di sangue secco. " +
			"Ai lati vedi varie porte, sulle quali è scritto col sangue dove conducono."
		);
	if (v.spostato==1) {
		v.spostato = 2;
		testoNlCSS("evidFrase", "Senti dei passi provenienti dalla stanza delle torture.");
	} else Eventi();
	scelta("Vai alla serra", Serra)
	scelta("Vai in cucina", Cucina)
	scelta("Vai in biblioteca", Biblioteca)
	if (!v.portaAperta) {
		plugins.get("extObjects").sceltaOgg("Porta rossa", PortaRossaChiusa,
				"chiaveRossa", PortaRossaApri,
				"torcia", "messaggio(\"Una vecchietta si affaccia dalla cucina e ti informa che se ti azzardi a bruciare le sue amate porte ti farà a pezzettini.\")",
				"+", "Inutile()"
			);
	} else {
		scelta("Porta rossa", LabirintoRosso);
	}
	scelta("Vai alla trappola mortale", TrappolaMortale)
	scelta("Vai alla sala delle torture", SalaTorture)
  }
}

function PremiQui() {
	//suono("risata.mp3");
	titolo("La trappola")
	testoNl(
		"Ecco. Se c'era una cosa cretina che potevi fare era proprio questa. Ma se io ti dico di buttarti dalla finestra, tu ti butti?!?",
		"",
		"Il muro alla tua destra si apre e ne esce un alligatore.",
		"Il muro alla tua sinistra si apre e ne esce una tigre dai denti a sciabola.",
		"Il soffitto si apre e cade un pesantissimo macigno.",
		"Nessuno saprà mai se sei stato ucciso dall'alligatore, dalla tigre o dal macigno."
	)
}

function Buio() {
	titolo("Il buio")
	testoNl("Prosegui nel buio. Senti delle risate infantili, hanno qualcosa di spettrale. " +
		"Ti sembra anche di sentire un sibilo provenire da qualche parte. Improvvisamente qualcosa di viscido ti sfiora il collo! " +
		"Decidi di fuggire, nella speranza di tornare indietro finchè sei in tempo... ma qualcosa ti afferra il collo, " +
		"e l'ultima cosa che senti sono degli artigli che dilaniano il tuo volto."
	)
	testoNl("Questa è la fine che fanno tutti gli zombi imprudenti, prima o poi.");
}

function TrappolaMortale() {
	//suono('risata.mp3');
	titolo("La trappola mortale")
	testoNl(
		"Sai, a volte penso che tu lo faccia apposta.",
		"Se è così, fammelo sapere: scriverò un gioco dove devi riuscire a morire, sfuggendo ai cattivi che cercano disperatamente di salvarti."
	)
	testoNl(
		"Apri la porta e, fischiettando allegramente, entri nella Trappola Mortale.",
		"La porta si richiude alle tue spalle. Sola ora ti accorgi che è a tenuta stagna.",
		"La stanza si riempe di acido muriatico e muori fra atroci sofferenze."
	)
	testoNl("Nel caso in cui questo non fosse quello che desideravi, la prossima volta vai in Cucina, o in Biblioteca; non entrare proprio in un posto che si chiama \"La Trappola Mortale\".")
}

function Serra() {
	titolo("La serra")
	testoNl("Questo ambiente non c'è ancora!")
	scelta("Torna nel corridoio", CorridoioSotterraneo);
}

function Cucina() {
	titolo("La cucina")
	testoNl("Ti trovi in una cucina lurida. Ovunque vi sono pezzi di carne tagliata e " +
		"schizzi di sangue. In un piatto sporco vedi dei vermi."
	)
	testo("<p>Su un tavolo di marmo, una ");
	rinvio("simpatica vecchietta", Vecchietta);
	testo(" sta tagliando a fettine un braccio umano con una mannaia.");
	Eventi();
	scelta("Torna nel corridoio", CorridoioSotterraneo);
}

function Vecchietta() {
  var frase;
  titolo("La cucina")
  if (v.vecchietta) {
	frase = FraseCasuale(
			"Non è morto ciò che in eterno giace, e in strani eoni anche la morte può morire.",
			"Quando all'inferno non ci sarà più posto i vivi cammineranno sulla terra.",
			"Sto preparando un patè di stomaco putrefatto. Sai, questa sera abbiamo a cena gli Addams...",
			"Ti piacciono le dita? La mia Torturina le adora... che cara zombina!",
			"Hai visto per caso Skull lo Spadaccino? L'ho lasciato nella bara che dormiva, ma non fa bene dormire troppo!",
			"Hai sentito l'ultimo cd dei Cannibal Corpse?"
		);
	testoNl("La vecchietta ti sorride e ti dice:");
	testoNlCSS("evidFrase", frase);
	scelta("Ti allontani", Cucina);
  } else {
	  testoNl("La simpatica vecchietta ti saluta cordialmente. Ha l'aria afflitta. Si lamente perchè la sua cena è dura da tagliare e avrebbe bisogno di strumenti più adatti.")
	  if (dado(2)>1)
		testoNl("Nel raccontarti tutto questo si distrae e si taglia un dito; con una scrollata di spalle, lo raccatta e se lo mangia in un boccone.")
	  testo("<p>Ti chiede se per favore hai un oggetto che faccia al caso suo; tende ");
	  plugins.get("extObjects").rinvioOgg("la mano", "messaggio(\"La vecchietta ti grida:<br/><strong>Non voglio che tu mi dia la mano, idiota, voglio che tu mi dia quello che ti ho chiesto!!</strong><br>Che scorbutica!\");",
			"spada", VecchiettaSpada,
			"spiedino", "messaggio(\"La vecchietta ti ringrazia, ma non ha fame. Ti chiede di nuovo qualcosa per tagliare la carne.\")",
			"+", VecchiettaNo
		);
	  testo(" e resta in attesa.</p>");
	  scelta("Non le dai niente", VecchiettaNiente);
  }
}

function VecchiettaNo() {
	//suono("risata.mp3");
	titolo("La cucina");
	testoNl("La vecchietta osserva indispettita il tuo dono e ti urla:",
		"\"Cos'è questa roba!? Cosa dovrei farmene!? Mi stai prendendo in giro!? Ora ti faccio passare la voglia di prenderti gioco delle persone anziane!!\"",
		"Con queste parole ti salta addosso e ti azzanna alla gola. Siccome sei uno zombo non muori; tenti di reagire, ma la donna ti afferra la testa fra le mani per sbranarti il volto e poi il cervello.",
		"E questa volta è davvero la tua fine."
	);
}

function VecchiettaNiente() {
	//suono("risata.mp3");
	titolo("La cucina")
	testoNl("La vecchietta ti osserva indispettita e ti urla:",
		"\"Come sarebbe a dire che non hai niente per me!? Non ci pensi alla fatica che faccio, usando strumenti non adatti!? Ma adesso ti insegno io l'educazione, giovane debosciato!!\"",
		"Con queste parole ti salta addosso e ti azzanna alla gola. Siccome sei uno zombo non muori; tenti di reagire, ma la donna ti afferra la testa fra le mani per sbranarti il volto e poi il cervello.",
		"E questa volta è davvero la tua fine."
	)
}

function VecchiettaSpada() {
	titolo("La cucina")
	testoNl("Tenti di tagliare la mano alla vecchietta, ma lei ha una pellaccia troppo resistente. Non si accorge nemmeno del tuo patetico tentativo, prende la spada come se fosse un dono e ti osserva con gratitudine:",
		"\"Oh, giovanotto, con questa sì che potrò cucinare come si deve! Per ringraziarti, voglio donarti una cosa che ti servirà per uscire vivo (anzi morto) da qui...\"",
		"Ciò detto ti porge una chiave rossa, che tu afferri perplesso."
	)
	v.spada        = 0;
	v.chiaveRossa  = 1;
	v.vecchietta   = 1;
	scelta("Torna nel corridoio", CorridoioSotterraneo);
}

function Biblioteca() {
	titolo("La biblioteca");
	testoNl("Sei in un'ampia biblioteca. Sugli scaffali sono riposti numerosi volumi antichi, molti dei quali sono scritti a mano.",
		"Su un tavolo di lettura bruciano due candele."
	);
	testoNl("Su uno scaffale sono riposti i seguenti libri:");
	scelta("Anche i morti nel loro piccolo si incazzano", LibroBarzellette);
	scelta("De Vermis Mysteriis", LibroDeVermis);
	scelta("Il richiamo di Chtulhu", LibroChtulhu);
	scelta("Avventura nel castello", LibroErix);
	nl();
	scelta("Torna nel corridoio", CorridoioSotterraneo);
}

function LibroBarzellette() {
	titolo("Anche i morti...");
	testoNl("E' un libro di barzellette. Lo apri e ne peschi una a caso:");
	var d = dado(8);
	if (d == 1) {
		testoNl("Mmmm... no, questa è troppo sporca.");
	} else if (d == 2) {
		testoNlCSS("libro",
				"Incidente mortale: un carro funebre si scontra con un camion pieno di yo-yo.",
				"Sedici volte."
			);
	} else if (d == 3) {
		testoNlCSS("libro",
				"C'è vita dopo la morte?",
				"Qualche volta, il sabato sera..."
			);
	} else if (d == 4) {
		testoNlCSS("libro",
				"Due amici si incontrano. Uno dei due ha i vestiti strappati ed è pieno di graffi, così l'altro gli chiede:",
				"- Che ti è successo, Gigi?",
				"- Sai, stamattina ho seppellito mia suocera...",
				"- Oh, mi dispiace tanto... ma come ti sei fatto male?",
				"- Beh, sai, lei faceva resistenza..."
			);
	} else if (d == 5) {
		testoNlCSS("libro",
				"E' pomeriggio, suona il telefono; la mamma è di sopra e il papà è al lavoro, così risponde Pierino.",
				"- Pronto?",
				"- Ciao, sono papà! Passami la mamma!",
				"- Non posso, sta facendo l'amore con il tuo migliore amico!",
				"- Cosa?!? Allora ascoltami: vai in garage a prendere la motosega.",
				"Un lungo silenzio, e poi: - Fatto!",
				"- Bene, ora vai di sopra e fai a pezzettini la mamma e il suo amichetto.",
				"- Ma... ma papà, è la mia mamma!!!",
				"- E io sono il tuo papà!! Obbedisci o ti taglio la paghetta!!",
				"Lungo silenzio, e poi in lacrime: - Fatto!",
				"- Bene, adesso seppelliscili in giardino!",
				"- Ma papà, noi non abbiamo il giardino!",
				"- ...",
				"- P-papà?..",
				"- Scusa, ho sbagliato numero."
			);
	} else if (d == 6) {
		testoNlCSS("libro",
				"Cos'è uno scheletro nell'armadio?",
				"Un carabiniere che ha vinto giocando a nascondino."
			);
	} else if (d == 7) {
		testoNlCSS("libro",
				"Due vermetti si incontrano. Il primo è tutto spettinato (sì, ha i capelli, e allora???), così l'altro gli chiede cosa gli sia accaduto. Il vermetto malandato gli spiega che ha dormito sulle labbra dello zombo motociclista. Allora l'altro gli indica un posto più tranquillo dove riposare: salendo sopra le gambe di una zomba, si trova un boschetto bellissimo e pacifico. Ringraziando, il vermetto spettinato saluta e se ne va.",
				"Il giorno dopo si incontrano di nuovo, ma il vermetto è sempre spettinato! Così l'altro gli domanda:",
				"- Ma non hai seguito il mio consiglio??",
				"- Sì, sì... sono andato nel boschetto tranquillo...",
				"- E allora cosa ti è successo??",
				"- Non saprei... mi sono svegliato sulle labbra dello zombo motociclista!"
			);
	} else if (d == 8) {
		testoNlCSS("libro",
				"Perché gli zombi camminano lentamente e barcollano?",
				"Perché sono morti di sonno!"
			);
	}
	scelta("Un'altra!", Biblioteca);
	scelta("Chiudi il libro", Biblioteca);
}

function LibroDeVermis() {
	titolo("De Vermis Misteryis");
	testoNl("Le caverne più interne non sono fatte perché occhi umani le vedano; perché le loro meraviglie sono strane e terrificanti. Maledetto è il terreno dove le anime morte vivono con corpi nuovi e bizzarri, e malvagia è la mente che non è contenuta in alcuna testa. Saggiamente Ibn Schacabao disse che felice è la tomba dove non è stato seppellito un Mago, e, di notte, felice è la città i cui Maghi sono tutti in cenere. Una vecchia leggenda dice che l'anima venduta al diavolo non lascia il suo involucro di carne, ma ingrassa e istruisce il verme che la corrode; finché dalla corruzione nasce un'orrida vita, e gli ottusi sciacalli della terra si coprono di cera per affliggerla e si gonfiano mostruosamente per torturarla. Grandi grotte vengono scavate in segreto laddove i pori della terra dovrebbero bastare, e cose che dovrebbero strisciare hanno invece imparato a camminare.");
	if (dado(3) > 2)
		testoNl("Mentre leggi queste macabre parole, un topo cade dal soffitto e corre via squittendo... hai rischiato l'infarto!");
	else
		testoNl("Brrr... che libro pauroso!");
	scelta("Chiudi il libro", Biblioteca);
}

function LibroChtulhu() {
	titolo("Il richiamo di Chtulhu");
	testoNlCSS("libro",
			"Ritengo che la cosa più misericordiosa al mondo sia l'incapacità della mente umana a mettere in correlazione tutti i suoi contenuti. Viviamo su una placida isola di ignoranza nel mezzo del nero mare dell'infinito, e non era destino che navigassimo lontano. Le scienze, ciascuna tesa nella propria direzione, ci hanno finora nuociuto ben poco; ma, un giorno, la connessione di conoscenze disgiunte aprirà visioni talmente terrificanti della realtà, e della nostra spaventosa posizione in essa che, o diventeremo pazzi per la rivelazione, o fuggiremo dalla luce mortale nella pace e nella sicurezza di un nuovo Medioevo."
		);
	if (dado(3) > 2)
		testoNl("Mentre leggi queste macabre parole, un topo cade dal soffitto e corre via squittendo... hai rischiato l'infarto!");
	else
		testoNl("Brrr... che libro angosciante!");
	scelta("Chiudi il libro", Biblioteca);
}

function LibroErix()
{
	titolo("Avventura nel castello");
	testoNl("Che strano libro!",
		"Narra la storia di un tizio che per caso capita in un castello scozzese pieno di fantasmi e trappole.",
		"Ti colpisce questo brano in particolare:"
	);
	testoNlCSS("libro",
		"...il passaggio segreto si chiuse alle spalle dell'eroe, che si ritrovò intrappolato nel labirinto.",
		"I corridoi sembravano tutti uguali, non vi erano punti di riferimento, e si sarebbe certamente perduto se non avesse ricordato un'antica leggenda:",
		"la storia di Teseo che, per trovare l'uscita dal labirinto, seguì il SENO di Arianna (la quale gli faceva il filo)."
	);
	testoNl("Il SENO di Arianna?.. chissà cosa significa...");
	scelta("Chiudi il libro", Biblioteca);
}

function PortaRossaChiusa() {
	titolo("La porta rossa");
	testoNl("Questa porta è chiusa. Ti chiedi quali meraviglie si nascondano dietro di essa.");
	scelta("Torna nel corridoio", CorridoioSotterraneo);
}

function PortaRossaApri() {
	titolo("La porta rossa");
	testoNl("Infili la chiave rossa nella serratura della porte rossa e la giri...",
		"il sangue sulle tue mani ti fa capire che entrambe non sono rosse, ma solo insanguinate!",
		"La porta si apre con un sinistro cigolio..."
	);
	v.chiaveRossa = 0;
	v.portaAperta = 1;
	continua(LabirintoRosso);
}

function LabirintoRosso() {
	titolo("Il labirinto rosso");
	testo("<p>Ti trovi all'inizio del Labirinto Rosso. Hai sentito una strana ");
	rinvio("leggenda", LeggendaLabirinto);
	testo(" su questo luogo.</p>");
	Eventi();
	v_labirinto["titolo"] = "Il labirinto rosso";
	v_labirinto.testo = "<p>Sei nel labirinto rosso. Non riesci a capire se le pareti siano rosse o coperte di sangue. I corridoi sembrano tutti uguali e questo ti disorienta...</p>";
	v_labirinto.eventi = 1;
	v_labirinto.destinazione = "UscitaLabirinto";
	v_labirinto.soluzione = "senno";
	scelta("Nord",   "v_labirinto.direzione='n'; vai('Labirinto')");
	scelta("Est",    "v_labirinto.direzione='e'; vai('Labirinto')");
	scelta("Sud",    "v_labirinto.direzione='s'; vai('Labirinto')");
	scelta("Torna nel corridoio", CorridoioSotterraneo);
}

function LeggendaLabirinto() {
  titolo("La leggenda del labirinto rosso");
  testoNl("Secondo la leggenda, questo labirinto (che originariamente era giallo) ospitava una terribile fanciulla di nome Arianna.",
		"Un giorno Teseo decise di entrare in questo luogo maledetto per liberare il mondo dalla sua presenza.",
		"Allora il Minotauro, che era una persona molto premurosa, gli donò un gomitolo di lana: \"Srotolalo man mano che cammini e potrai ritrovare l'uscita!\", gli disse.",
		"Così fece Teseo, ma quando trovò Arianna ella lo uccise e dilaniò il suo corpo.",
		"La terribile fanciulla usò il sangue dell'eroe per dipingere il labirinto di rosso e il filo di lana per trovare l'uscita e mangiare il Minotauro.",
		"Dopodichè, visse tutta felice e contenta."
	);
  continua(LabirintoRosso);
}

function UscitaLabirinto() {
  titolo("USCITA");
}

function DeathScheletro() {
	titolo("La bara");
	testoNl(
		"Non avendo niente da fame ed essendo irresistibilmente attratto dal fuoco come un bambino non troppo intelligente, ti viene la fantastica idea di dare fuoco a una bara."
	);
	
	if (v.spostato < 2) {
		testoNl(
			"E non una bara qualsiasi: una bara con uno scheletro dentro.",
			"E non una bara con uno scheletro dentro qualsiasi: una che si trova nei sotterranei del cimitero dove una zombina ti ha appena ucciso."
		);
	} else {
		testoNl(
			"Peccato che il suo abitante stia entrando proprio in questo momento nella stanza....."
		);
	}
	testoNl(
			"Sei davvero sicuro di voler sapere cosa ti accadrà?"
		);
	scelta("Sì, sono pronto a tutto!", DeathScheletro2);
	scelta("No, voglio la mamma!", DeathPietas);
}

function DeathScheletro2() {
  titolo("La bara");
  testoNl(
		"Molto bene, se proprio ci tieni...",
		"Mentre attendi impaziente che il fuoco attecchisca sul legno, la bara si apre.",
		"Lo scheletro si volge verso di te, e con voce cavernosa chiede: \"Che cazzo fai?!\".",
		"Gli rispondi balbettando che puoi spiegare tutto e che non è come sembra, ma lui non ti dà molto ascolto.",
		"Il caro estinto ti strappa la torcia dalle mani e te la caccia in bocca (sei fortunato ad essere stato tagliato in due, altrimenti potrebbe ficcarla altrove).",
		"Mentre senti il rumore del tuo cervello che abbrustolisce, ricordi che la mamma ti aveva avvisato di non bruciare gli scheletri sonosciuti."
	);
}

function DeathPietas() {
  titolo("L'ultimo viaggio");
  testoNl(
		"Già. Ti capisco. Conoscere i dettagli sarebbe a dir poco penoso.",
		"Comunque questo non ti salverà: sei morto, amico. Dì pure addio a questa valle di lacrime.",
		"Non sei molto bravo con questo gioco. Prova col ping pong, magari ti riesce meglio."
	);
}

