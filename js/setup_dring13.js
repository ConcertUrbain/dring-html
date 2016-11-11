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
	appView.mapURL = "medias/cartes/CARTE_DRING13.jpg";
	appView.keyApi = "D93_qJlCaSsBbYBYypwF9TT8KmCOxhuZ";
	appView.adminParams = ["mazerte", "desperados", App.Views.appView.keyApi];
	
	appView.connectToWebServices();

});
