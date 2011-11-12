function extSaveMe()
{
	this.begin = function()
	{
		
	}
	
	this.restart = function() {
		mostra(m_confermaRiparti);
	}
	
	this.m_confermaRiparti = function()
	{
		scriviMessaggio("Ricomincio?", "Abbandono la situazione corrente e ricomincio il gioco dall'inizio?")
		scelta("S&igrave;, ricomincia dall'inizio", "gioca()")
		scelta("No, torna al gioco", "ridisegna()")
	}
}
