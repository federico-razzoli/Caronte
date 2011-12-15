/*
	This is a very simple example of Caronte Application.
	It has been created for didactical purpose only.
	You are free to use, copy, modify and / or redistribute this file
	with any license; there is no condition.
*/

function Inizia() {
	vai(Intro);
}

function Intro() {
	SW.titleLocale("intro.title");
	SW.sayLocale("intro.text");
	SW.moreLocale("more", Stanza2);
}

function Stanza2() {
	SW.titleLocale("stanza2.title");
	SW.sayNlLocale("stanza2.text", "stanza2.text");
	SW.sayNlCSSLocale("evidFrase", "stanza2.text", "stanza2.text");
}

var info = {
	name       : "app.title",
	author     : "Federico Razzoli",
	copyright  : "app.copy"
};

