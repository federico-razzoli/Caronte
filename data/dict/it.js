// Dictionary: it

"use strict";

// funzioni base
var vai         = function()  { SW.goTo.apply(SW, arguments); }
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

// luoghi speciali
if (typeof Intestazione  != "undefined")
	var _header     = function()  { Intestazione.apply(null, arguments); }
if (typeof PiePagina     != "undefined")
	var _footer     = function()  { PiePagina.apply(null, arguments);; }



// info sull'Applicazione (opzionale)
var dictInfo =
{
	name        : "it",
	version     : "0.1",
	license     : "AGPLv3",
	licenseURL  : "https://www.gnu.org/licenses/agpl.html",
	author      : "Federico Razzoli",
	contacts    : "santec [At) riseup [Dot' net",
	copyright   : "2011 Federico Razzoli",
	notes       : "Compatibile con IDRA1. No plugin, per ora."
};


// -- FINE DEL DIZIONARIO
var dictOk = true

