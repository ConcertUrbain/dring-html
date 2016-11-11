$(function()
{
	window.App = {};
	
	App.eventManager = _.extend({}, Backbone.Events);
	
	App.Models = {};
	App.Collections = {};
	App.Views  = {};
	
	App.Views.appView = new Dring13AppView();
	
	var appView = App.Views.appView;
	
	appView.proxy = "proxy/ba-simple-proxy.php?url=";
	appView.serviceURL = "http://ws.chatanoo.org/services";
	appView.mediaCenterURL = "http://mc.chatanoo.org/m/";
	appView.awsURL = "http://medias.aws.chatanoo.org/";
	appView.keyApi = "D93_qJlCaSsBbYBYypwF9TT8KmCOxhuZ";
	appView.adminParams = ["mazerte", "desperados", App.Views.appView.keyApi];
	
	// Emplacement de la carte (modifiable via les meta-données de l'admin Flash, question par question)
	appView.latitudeGMaps = 48.82129;
	appView.longitudeGMaps = 2.366234;
	appView.zoomGMaps = 17;
	
	appView.connectToWebServices();

});
