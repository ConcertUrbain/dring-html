$(function()
{
	$.getJSON('config.json', function(config) {
		window.App = {};

		App.eventManager = _.extend({}, Backbone.Events);

		App.Models = {};
		App.Collections = {};
		App.Views  = {};

		App.Views.appView = new Dring13AppView();

		var appView = App.Views.appView;

		appView.proxy = config.POXY;
		appView.serviceURL = config.SERVICE_URL;
		appView.mediaCenterURL = config.MEDIAS_CENTER_URL;
		appView.awsURL = config.AWS_URL;
		appView.mediaInputBucket = config.MEDIAS_CENTER_INPUT_BUCKET;
		appView.mediaOutputBucket = config.MEDIAS_CENTER_OUTPUT_BUCKET;
		appView.mediaCognitoPool = config.MEDIAS_CENTER_COGNITO_POOL;
		appView.keyApi = config.API_KEY;
		appView.adminParams = [config.USER, config.PASS, App.Views.appView.keyApi];

		// Emplacement de la carte (modifiable via les meta-données de l'admin Flash, question par question)
		appView.latitudeGMaps = 48.82129;
		appView.longitudeGMaps = 2.366234;
		appView.zoomGMaps = 17;

		appView.connectToWebServices();
	})
});
