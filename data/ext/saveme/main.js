/*
    This file is a plugin for Caronte.
	
    extSaveMe is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 3 of the License.
	
    extSaveMe is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
	
    You should have received a copy of the GNU General Public License
    along with Nome-Programma; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


//"use strict";

UTILE.funcExts["extSaveMe"] = function () {
	function load() { 
		var saveMe = menu.addSection("secSaveMe");
		saveMe.addButton(null,  "bttSave",     "appSave()",     "Salva",       "Salva la situazione corrente");
		saveMe.addButton(null,  "bttLoad",     "appLoad()",     "Carica",      "Riprendi una situazione salvata");
		saveMe.addButton(null,  "bttRestart",  "SW.prepare()",  "Ricomincia",  "Ricomincia l'avventura");
	}
	
	// save current situation (SW.v)
	function appSave() {
		var statoPrecedente = SW.v;
		// does a saved state exist?
		var cookie = this.leggiCookie(this.nomeCookie);
		if (cookie == null || modal.confirm("I salvataggi precedenti salvare eliminati.<br>Desideri salvare?")) {
			var result = registraCookie(this.nomeCookie, statoPrecedente, durataCookie);
			if (cookie == statoPrecedente) { //verifica se ha salvato
				this.situazioneSalvata = null; //elimina eventuale situazione dalla variabile
				modal.info("Salvataggio riuscito.<br>La situazione è stata registrata su disco in un &quot;cookie&quot;.<br>Sar&agrave; rileggibile per " + durataCookie + " giorni, a meno che non venga eliminata prima dal browser per eccessivo affollamento.");
			} else {
				this.situazioneSalvata = statoPrecedente; //non puo' usare i cookie, salva in una variabile
				if (!result)
					modal.info("I dati da salvare sono troppi. Dimensione massima: 4000 byte)");
				else
					modal.info("Impossibile salvare. Controllare che i cookie siano abilitati.");
			}
		}
	}
	
	// ask confirm and load situation
	function appLoad() {
		var cookie = this.leggiCookie(nomeCookie);
		if (cookie == null) {
			modal.bad("Nessun salvataggio disponibile");
		} else if (modal.confirm("Desideri caricare la situazione salvata?")) {
			if (cookie) { //ricontrolla se ha riletto (tanto per sicurezza)
				ripristinaStato(cookie);
				SW.refresh(); //avendo ripristinato lo statoPrecedente, ricostruisce quello attuale
			} else {
				modal.bad("Nessun salvataggio disponibile");
			}
		}
	}
	
	// Registra un cookie contenente i dati, con la durata specificata
	function registraCookie(nome, dati, giorni) {
		var expires = new Date();
		expires.setTime(expires.getTime() + giorni * 1000 * 86400);
		var cookie = nome + "=" + escape(dati) +"; expires=" + expires.toGMTString();
		if (cookie.length <= 4000) { // some browser may be 409x or 5000, but 4000 is cross-browser
			document.cookie = cookie;
			return true;
		}
		return false;
	}
	
	// Legge un cookie, ritorna i dati o null se non lo trova
	function leggiCookie(nome) {
		var dati = null;
		var ck = document.cookie;
		var id = this.nomeCookie + "=";
		var p = ck.indexOf(id, 0); //cerca cookie con quel nome
		if (p != -1) { //se lo ha trovato
			p += id.length; //salta nome e '='
			var sep = ck.indexOf(";", p); //cerca il separatore a fine dati
			if (sep == -1) sep = ck.length;
			dati = unescape(ck.substring(p, sep));
		}
		return dati;
	}
	
	function opzioniCookie(nome, giorni) {
		this.nomeCookie    = nome;
		this.durataCookie  = giorni;
	}
	
	// return a string representing v's properties + SW.qui
	function creaStringaStato() {
		var listKeys     = "";
		var listValues   = "";
		for (var key in v) {
			var value = v[key];
			if (typeof(value) == "string") { //se e' una stringa e non un numero
				value = '"' + value.replace('"', '\"') + '"';
			}
			// add key & value to separated lists
			listKeys    += ",";
			listKeys    += key;
			listValues  += ",";
			listValues  += value;
		}
		// drop initial ","
		listKeys    = listKeys.substr(1);
		listValues  = listValues.substr(1);
		// key1,key2,...|value1,value2,...|qui
		return listKeys + "|" + listValues + "|" + SW.pageName(SW.qui);
	}
	
	var nomeCookie         = "app",
		durataCookie       = 365,
		situazioneSalvata  = null;   // null if empty
	
	return {
		load:load,
		appSave:appSave,
		appLoad:appLoad
	};
}();

