/*
	This is a very simple example of Caronte Application.
	It has been created for didactical purpose only.
	You are free to use, copy, modify and / or redistribute this file
	with any license; there is no condition.
*/

function Inizia() {
	vai(Introduzione);
}

function Introduzione() {
  titolo("Benvenuto in Caronte!");
  testoNl(
		"Questo file serve solo a testare che per default venga caricato gioco.js, e come scorciatoia per le seguenti Applicazioni:",
		"",
		"Vai a <strong><a href=\"?torturina\">In fuga da Torturina</a></strong>",
		"Vai a <strong><a href=\"?ex/lang=it\">Esempio di avventura localizzata</a></strong>"
	);
}
