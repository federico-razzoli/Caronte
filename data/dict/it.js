// Dictionary: it

"use strict";

// funzioni base
var vai         = function()  { SW.goTo.apply(SW, arguments); }
var aggiorna    = function()  { SW.refresh.apply(SW, arguments); }
var titolo      = function()  { SW.title.apply(SW, arguments); }
var testo       = function()  { SW.say.apply(SW, arguments); }
var testoNl     = function()  { SW.sayNl.apply(SW, arguments); }
var testoNlCSS  = function()  { SW.sayNlCSS.apply(SW, arguments); }
var nl          = function()  { SW.nl.apply(SW, arguments); }
var rinvio      = function()  { SW.link.apply(SW, arguments); }
var scelta      = function()  { SW.option.apply(SW, arguments); }
var continua    = function()  { SW.more.apply(SW, arguments); }
var messaggio   = function()  { SW.message.apply(SW, arguments); }
var dado        = function()  { SW.dice.apply(SW, arguments); }

// funzioni per la traduzione (utili solo per le Applicazioni localizzate)
if (typeof appLocaleInfo !== "undefined") {
	var traduci        = function()  { locale.get.apply(SW, arguments); }
	var trad           = function()  { SW.sayLocale.apply(SW, arguments); }
	var tradTitolo     = function()  { SW.titleLocale.apply(SW, arguments); }
	var tradNl         = function()  { SW.sayNlLocale.apply(SW, arguments); }
	var tradNlCSS      = function()  { SW.sayNlCSSLocale.apply(SW, arguments); }
	var tradMessaggio  = function()  { SW.messageLocale.apply(SW, arguments); }
	var tradRinvio     = function()  { SW.linkLocale.apply(SW, arguments); }
	var optionLocale   = function()  { SW.optionLocale.apply(SW, arguments); }
	var moreLocale     = function()  { SW.moreLocale.apply(SW, arguments); }
}

// luoghi speciali
if (typeof Intestazione  !== "undefined") {
	window.onPageBegin   = function()  { Intestazione.apply(window, arguments); }
}
if (typeof PiePagina     !== "undefined") {
	window.onPageEnd     = function()  { PiePagina.apply(window, arguments); }
}


// info sul Dizionario (opzionale)
var dictInfo =
{
	name        : "it",
	version     : "0.1",
	license     : "AGPLv3",
	licenseURL  : "https://www.gnu.org/licenses/agpl.html",
	author      : "Federico Razzoli",
	contacts    : "santec [At) riseup [Dot' net",
	copyright   : "2011 Federico Razzoli",
	notes       : "Compatibile con IDRA. No plugin, per ora."
};


// -- FINE DEL DIZIONARIO
var dictOk = true;

