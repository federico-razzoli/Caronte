// Configurazione dell'Applicazione


// info sull'Applicazione (opzionale)
var info =
{
	name        : "In fuga da Torturina",
	title       : "In fuga da Torturina",
	URL         : "",
	version     : "0.1",
	maturity    : "Non Finito",
	date        : "2011",
	license     : "AGPLv3",
	licenseURL  : "https://www.gnu.org/licenses/agpl.html",
	author      : "Federico Razzoli",
	contacts    : "santec [At) riseup [Dot' net",
	copyright   : "2011 Federico Razzoli",
	descr       : "Una tenera zombina di nome Torturina ti ha ucciso, e ora sei anche tu uno zombo. Ma i tuoi guai non sono finiti: fuggi dai sotterranei del cimitero, prima che Torturina si svegli!",
	notes       : ""
};

// estensioni da usare
var extensions =
{
	extSaveMe :                  // estensione per il salvataggio delle avventure
	{ },                         // nessuna opzione
	
	extObjects :                 // estensione per usare gli oggetti nell'avventura
	{                            // opzioni:
		title  : "Inventario",      // titolo del riquadro
		size   : 15                 // altezza del riquadro in percentuale
	}
};

// opzioni di default per l'avventura (opzionale)
var defaultOptions =
{
	level : "easy"
};

