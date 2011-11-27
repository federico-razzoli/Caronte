// ITALIANO
// File di localizzazione per l'Estensione extObjects

var extObjects = plugins.get("extObjects");

var mostraOggetti         = function()  { extObjects.show.apply(extObjects, arguments); }

delete extObjects;


// FINE DEL FILE
plugins.fileLoaded();

