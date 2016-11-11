
Chatanoo.DringItemsView = Chatanoo.MosaiqueItemsView.extend({

	removeSubviews: function () {

		_.each(this.childViews, function(childView)
		{
			if (childView.close) {
				// cf prototype.close un peu plus haut
				childView.close();
			}
		});

		this.$el.find(".dringItem").remove();
	}

});

Chatanoo.DringItemView = Backbone.ChatanooView.extend({

	initialize: function (param) {
		
		Backbone.ChatanooView.prototype.initialize.call(this, param);
		
		// A lieu lors d'un nouveau vote sur cet item
		this.model.on("change:percentTop", function() {
			
			this.updateColor();
			
			// Il faudrait 
			// - trouver l'élément de la mosaique D'accord/Pas d'accord --> modifier le top
 			// - trouver tous les éléments itemXXX --> modifier la couleur
			
			// Perso de la mosaique Cool/Pas cool sur lequel on a ajouté un vote / un commentaire
			var elementCoolPasCool = $(".vue.votes .item" + this.get("id"));
			elementCoolPasCool.css("top", this.get("top") + "px");
			
			// Persos associés des différentes mosaiques
			var element = $(".item" + this.get("id"));
			var elementSvgPaths = $(".perso_path", element);
			elementSvgPaths.attr("fill", this.get("color"));
			
			// console.log(this.get("id"), elementCoolPasCool.length, element.length, elementSvgPaths.length, this.get("top"), this.get("color"));
			
		});
	},
	
	render: function (param) {
		Backbone.ChatanooView.prototype.render.call(this, param);
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	
	close: function (param) {
		
		this.model.off("change:percentTop");
		
		Backbone.ChatanooView.prototype.close.call(this, param);
	},		
});


//
// Vues Dring13 : 1 - Items
//

Chatanoo.CoolPasCoolView = Chatanoo.DringItemsView.extend({
	
	renderItem: function (item, no)
	{
		var itemView = new Chatanoo.CoolPasCoolItemView({
			model: item
		});
		
		// cf CollectionView
		this.addSubview(itemView);
		
		this.$el.append( itemView.render().el );	
	}

});

Chatanoo.CoolPasCoolItemView = Chatanoo.DringItemView.extend({
	
	initialize: function (param) {
		Chatanoo.DringItemView.prototype.initialize.call(this, param);
		this.template = _.template($("#dringTemplate").html());
		
		this.model.updateColor();
		this.model.updateVisitedAndCurrentColor();
		
		// A lieu lors d'un resize de la fenêtre
		var t = this;
		
		this.model.on("change:left", function() {
			t.$el.css("left", t.model.get("left") + "px");
		});
		
		this.model.on("change:top", function() {
			t.$el.css("top" , t.model.get("top")  + "px");
		});
	},
	
	render: function () {
		this.setElement(this.template(this.model.toJSON()));
		return this;
	},
	
    events: {
		"click a": "selectItem",
		"mouseover a": "rollOverItem",
		"mouseout a": "rollOutItem",
	},

    rollOverItem: function (e)
	{
		var el = $(e.currentTarget);
		
		var position = el.offset();
		var itemId = this.model.get("id");
		var titre = this.model.get("title");
		
		var v = App.eventManager;
		if (v) v.trigger("itemRollOver", itemId, titre, position);
	},

    rollOutItem: function (e)
	{
		var el = $(e.currentTarget);
		
		var position = el.offset();
		var itemId = this.model.get("id");
		var titre = this.model.get("titre");
		
		var v = App.eventManager;
		if (v) v.trigger("itemRollOut", itemId, titre, position);
	},

    selectItem: function (e)
	{
		var el = $(e.currentTarget);
		var parentEl = el.parent();
		
		var itemId = this.model.get("id");
		var motCle  = this.model.get("motCle");
		
		// console.log("ok", el, parentEl.data("id"), itemId);
		
		var v = App.eventManager;
		if (v) v.trigger("itemSelection", itemId, motCle);
	},
	
	close: function (param) {
		
		var t = this;
		
		$(t.el).undelegate('a', 'click');
		$(t.el).undelegate('a', 'mouseover');
		$(t.el).undelegate('a', 'mouseout');
		
		this.model.off("change:left");
		this.model.off("change:top");
		
		Chatanoo.DringItemView.prototype.close.call(this, param);
	},
});



//
// Vues Dring13 : 2 - Users
//

Chatanoo.UsersView = Chatanoo.DringItemsView.extend({
	
	el: "#users",
	
	renderItem: function (item, no)
	{
		// On n'affiche pas les users sans noms
		// console.log(item.get("pseudo"), item.get("items"));
		
		if ( (item.get("pseudo")).length > 0)
		{
			var itemView = new Chatanoo.UserView({
				model: item
			});
			
			// cf CollectionView
			this.addSubview(itemView);
			
			this.$el.append( itemView.render().el );	
			
			itemView.addItems();
		}
	}
	
});

Chatanoo.UserView = Backbone.ChatanooView.extend({
	
	initialize: function (param) {
		Backbone.ChatanooView.prototype.initialize.call(this, param);
		this.template = _.template($("#dringUserTemplate").html())
	},
	
	render: function () {
		
		this.setElement(this.template(this.model.toJSON()));
		
		return this;
	},
	
    events: {
		"click .userName": "playAllMedias"
	},	
	
	playAllMedias: function () {
		
		var items = this.model.get("items");
		if (! items) return;
	
		if (items.length > 0) {
			var v = App.eventManager;
			if (v) v.trigger("itemsSelection", items.concat() );
		}
	},
	
	addItems: function () {
		
		var el = this.el;
		
		var userName = $(".userName", el);
		var userItems = $(".userItemsParent", el);
		
		var w = userName.width();
		var h = userName.height();
		
		if (w == 0) {
			w = 8.8 * this.model.get("pseudo").length;
		}
		
		w = Math.max(40, w);
		h = Math.max(21, h);


		var items = this.model.get("items");
		var n = items.length;
		
		var indexItem = 0;
		var t = this;
		
		_.each(items, function(item) {

			var rx = 0.7 * w;
			var ry = 0.9 * h;
			var angle = Math.PI + 2 * Math.PI * indexItem/n;
			var angleDeg = Math.floor(180 / Math.PI * angle) + 90;
					
			var left = Math.floor(rx * Math.cos(angle) + rx / 1.2 - 20 );
			var top  = Math.floor(ry * Math.sin(angle) - ry * 1.2 );

			var clone = item.clone();
			clone.set("left", left);
			clone.set("top",  top);
			clone.set("angle", angleDeg)
			
			var userItemView = new Chatanoo.UserItemView({
				model: clone
			});
			
			// cf CollectionView
			// t.addSubview(userItemView);
			
			userItems.append( userItemView.render().el );	
			
			indexItem++;
		});
	},
	
	close: function (param) {
		
		var t = this;
		
		$(t.el).undelegate('.userName', 'click');
		
		Backbone.ChatanooView.prototype.close.call(this, param);
	},
});

// Affiche un personnage autour du nom de l'utilisateur (les personnages se rangent en cercle)
Chatanoo.UserItemView = Chatanoo.CoolPasCoolItemView.extend({
	
	initialize: function (param) {
		Chatanoo.CoolPasCoolItemView.prototype.initialize.call(this, param);
		this.template = _.template($("#dringUserItemTemplate").html())
	},

});


//
// Vues Dring13 : 3 - Mots-clés
//

Chatanoo.KeywordsView = Chatanoo.DringItemsView.extend({
	
	el: "#motcles",
	
	renderItem: function (item, no)
	{
		var itemView = new Chatanoo.KeywordView({
			model: item
		});
		
		// cf CollectionView
		this.addSubview(itemView);
		
		this.$el.append( itemView.render().el );	
		
		itemView.addItems();
	}
	
});

Chatanoo.KeywordView = Backbone.ChatanooView.extend({
	
	initialize: function (param) {
		Backbone.ChatanooView.prototype.initialize.call(this, param);
		this.template = _.template($("#dringMotCleTemplate").html())
	},
	
	render: function () {
		
		this.setElement(this.template(this.model.toJSON()));
		
		return this;
	},
	
    events: {
		"click .motCleTitle": "playAllMedias"
	},	
	
	playAllMedias: function () {
		
		var items = this.model.get("items");
		if (! items) return;
	
		if (items.length > 0) {
			var v = App.eventManager;
			if (v) v.trigger("itemsSelection", items.concat() );
		}
	},
	
	addItems: function () {
		
		var el = this.el;
		
		var keywordParent = $(".motCleItemsParent", el);
		
		var items = this.model.get("items");
		if (! items) return;
		
		var t = this;
		
		_.each(items, function(item) {

			var keywordItemView = new Chatanoo.CoolPasCoolItemView({
				model: item
			});
			
			// cf CollectionView
			// t.addSubview(userItemView);
			
			var keywordItemEl = keywordItemView.render().el;
			
			keywordParent.append( keywordItemEl );
	
			$(keywordItemEl, ".motCle").attr("style", "");
		});
	},
	
	close: function (param) {
		
		var t = this;
		
		$(t.el).undelegate('.motCleTitle', 'click');
		
		Backbone.ChatanooView.prototype.close.call(this, param);
	},
	
});


//
// Vues Dring13 : 4 (Carte Bitmap)
//

Chatanoo.MapItemsView = Chatanoo.DringItemsView.extend({
	
	el: "#carte",
	className:"carte",
	
	render: function () {
		
		this.removeSubviews();
		
		// 1. Background de la carte
		var bgImageModel = new Backbone.Model( { id:0, url: "medias/cartes/CARTE_DRING13.jpg" } );
		var bgView = new Chatanoo.ImageView( { model: bgImageModel } );
		this.$el.append( bgView.render().el );	
		
		// cf CollectionView
		this.addSubview(bgView);
		
		// 2. Items de la carte
		var no = 0;
		
		_.each(this.collection.models, function (item) {
			this.renderItem(item, no++);
		}, this);

	},
	
	renderItem: function (item, no)
	{
		var itemView = new Chatanoo.MapItemView({
			model: item
		});
		
		this.$el.append( itemView.render().el );	
		
		// cf CollectionView
		this.addSubview(itemView);	
	}
	
});

Chatanoo.MapItemView = Chatanoo.DringItemView.extend({
	
	initialize: function (param) {
		Chatanoo.DringItemView.prototype.initialize.call(this, param);
		this.template = _.template($("#dringMapTemplate").html())
	},
	
});



//
// Vues Dring13 : 4 (Carte Leaflet : GoogleMap, OpenStreetMap, etc...)
//

Chatanoo.LeafletMapItemsView = Chatanoo.DringItemsView.extend({
	
	el: "#carte",
	className:"carte",
	
	initialize: function (itemCollection, params) {
		
		this.initSubviews();
		
		// Params
		this.mapParams = params;
		
		// Liste des items
		this.collection = itemCollection;
		
		this.render();
	},
	
	render: function () {
		
		this.removeSubviews();
		
		var carte_osm = $("#carte_osm");
		if (carte_osm.length == 0) {
			this.$el.html('<div id="carte_osm" style="width:100%;height:100%"></div>');
		}
		
		var latitude = this.mapParams.latitude;
		var longitude = this.mapParams.longitude;
		var zoom = this.mapParams.zoom;
		
		var map = App.LeafLetMap;
		if (! map) {
			
			map = L.map('carte_osm');
			
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
		
			App.LeafLetMap = map;
		}
		
		map.setView([latitude, longitude], 12);
		
		
		// 2. Items de la carte
		
		var markers = this.markers;
		var marker;
		
		if (markers) {
			for(i=0; i<marker.length; i++)
			{
				marker = marker[i];
				marker.off("click"); 
				map.removeLayer(marker);
			}
		}

		this.markers = [];

		var persoIcon = L.icon({
			iconUrl: "images/persoHomme_small.png",
			iconRetinaUrl: "images/persoHomme_small.png",
			iconSize: [16, 38],
			iconAnchor: [8, 38],
			popupAnchor: [0, -40]
		});


		var iconTemplate = _.template($("#dringTemplate").html());
		
		_.each(this.collection.models, function (item) {
	
			var lat = item.get("latitude");
			var long = item.get("longitude");
			var itemId = item.get("id");
			var titre = item.get("title");
			
			if ( ! isNaN(lat) && ! isNaN(long) )
			{
				var iconHtml = iconTemplate(item.toJSON());
				iconHtml = iconHtml.split("position:absolute").join("");
				
				var persoIcon = L.divIcon({ 
					iconSize: new L.Point(50, 50), 
					html: iconHtml
				});
		
				marker = new L.Marker( new L.LatLng(lat, long), { icon : persoIcon } ).addTo(map);
				
				// Click :
				marker.on("click", function()
				{
					var v = App.eventManager;
					if (v) {
						v.trigger("itemSelection", itemId);
					}
				});
				
				// RollOver
				marker.on("mouseover", function()
				{
					var v = App.eventManager;
					if (v)  {
						var el = $(".itemTitre.item" + itemId, ".leaflet-container");
						var position = el.offset();
						v.trigger("itemRollOver", itemId, titre, position);
					}
				});
			
				// RollOut
				marker.on("mouseout", function()
				{
					var v = App.eventManager;
					if (v)  {
						var el = $(".leaflet-container .itemTitre.item" + itemId);
						var position = el.offset();
						v.trigger("itemRollOut", itemId, titre, position);
					}
				});

				this.markers.push(marker);
			}
			
		}, this);
		
	},
	
	close: function() {

		var map = App.LeafLetMap;
		if (map && _.isArray(this.markers)) {
			
			var i, n = this.markers.length, marker;
			for(i=0; i<n; i++)
			{
				marker = this.markers[i];
				marker.off("click");
				marker.off("mouseover");
				marker.off("mouseout");
				
				map.removeLayer(marker);
			}
			
			this.markers = null;
		}
		
		Backbone.CollectionView.prototype.close.call(this);
	}	
});



//
// PopUp de Vote Dring13 :
//

Chatanoo.CoolPasCoolPopUpView = Chatanoo.PopUpView.extend({
	
	choix1: "COOL",
	choix2: "PAS COOL",
	
    events: {
		"click .popupClose": "closePopUp",
		"click .voteButton.cool": "voteCool",
		"click .voteButton.pasCool": "votePasCool",
	},	
	
	voteCool: function(e) {
		this.sendVote(1);
	},
	
	votePasCool: function(e) {
		this.sendVote(-1);
	},
	
 	sendVote: function(voteValue) {
		var t = this;
		
		var itemId = t.model.get("itemId");
		
		var v = App.eventManager;
		if (v) v.trigger("voteMedia", itemId, voteValue);
	},
	
 	closePopUp: function(e) {
		
		var t = this;
		
		$(t.el).undelegate('.popupClose', 'click');
		$(t.el).undelegate('.voteButton.cool', 'click');
		$(t.el).undelegate('.voteButton.pasCool', 'click');
		
		t.$el.css("display", "none");
		t.$el.css("width", "");
		t.$el.css("height", "");
		
		if (t.subview && t.subview.close) subview.close();
		
		t.off();
		t.$el.empty();
		t.clearTimeOuts();
			
		// t.close()
	},
	
 	render: function( options ) {
		
		var t = this;
		
		if (options && options.width) t.$el.css("width", options.width);
		if (options && options.height) t.$el.css("height", options.height);
		
		t.$el.css("display", "block");
		t.$el.html(t.template( { choix1: String(this.choix1).toUpperCase(), choix2: String(this.choix2).toUpperCase() } ));
		
		var popUpElement = t.$el;
		var popUpHeader = t.$el.find(".popupHeader");

		var onDragEnd = function(e) {
			// var itemDragged = e.currentTarget;
			// var draggableObject = Draggable.get(itemDragged);
		};
			
		Draggable.create(popUpElement,{ type:"x,y", trigger:popUpHeader, onDragEnd:onDragEnd });
		
		return this;
    }
});


	
//
// Contrôleur Dring13
//

var Dring13AppView = AppView.extend({

	initialize: function () {
		
		// Evènement JQuery
		$.event.special.removed = {
			remove: function(o) {
				if (o.handler) {
					o.handler()
				}
			}
		}
		
		
		var t = this;
		
		
		//
		// Cool / Pas cool
		//
		
		this.choix1 = "Cool";
		this.choix2 = "Pas cool";
		
		$(".onglet.items").html( "<p>" + this.choix1 + " " + this.choix2 + "</p>");
		

		// Envoi
		$("#envoyer").on("click", function() { 
			t.openUploadView();
		});
		
		// Bouton Plein écran
		$(".plein_ecran").on("click", function() { toggleFullscreen(); });
		
		// Carte : n'est plus utilisée...
		this.mapURL = "medias/cartes/CARTE_DRING13.jpg";
		this.largeurCarte = 2416;
		this.longueurCarte = 1110;
		this.latitudeTop = 48.834982;
		this.latitudeBottom = 48.811347;
		this.longitudeGauche = 2.304247;
		this.longitudeDroite = 2.377739;
		
		/*
		// ... Emplacement de la carte 
		this.latitudeGMaps = 48.82129;
		this.longitudeGMaps = 2.366234;
		this.zoomGMaps = 17;
		*/	
		
	
		//
		// Vues et fonctionnement des onglets
		//
		
		var selectVue = function(motscles, items, carte, users)
		{
			$(".onglet").removeClass("inactive").addClass("inactive");
			
			$("#motcles").css("display", motscles ? "block" : "none");
			$("#votes").css("display", items ? "block" : "none");
			$("#carte").css("opacity", carte ? 1 : 0);
			$("#users").css("display", users ? "block" : "none");
		}
		
		// Onglet "D'accord/Pas d'accord" par défaut
		selectVue(0, 1, 0, 0);
		$(".onglet.items").removeClass("inactive");
		
		$(".onglet.motcles").on("click", function() {
			selectVue(1, 0, 0, 0);
			$(this).removeClass("inactive");
			$(".onglets").attr("class", "headerItem onglets motcles");
		});
			
		$(".onglet.items").on("click", function() {
			selectVue(0, 1, 0, 0);
			$(this).removeClass("inactive");
			$(".onglets").attr("class", "headerItem onglets items");
		});
		
		$(".onglet.carte").on("click", function() {
			selectVue(0, 0, 1, 0);
			$(this).removeClass("inactive");
			$(".onglets").attr("class", "headerItem onglets carte");
		});
		
		$(".onglet.users").on("click", function() {
			selectVue(0, 0, 0, 1);
			$(this).removeClass("inactive");
			$(".onglets").attr("class", "headerItem onglets users");
		});
		
		
		//
		// Resize
		//
		
		var resize = function()
		{
			t.redrawViews();
		};

		window.onresize = function()
		{
			resize();
		};
		
		resize();		
	},
	

	// --------------------------------------------------
	//
	// Mosaïques
	//
	// --------------------------------------------------
	
	fetchProjectsSuccess: function() {
		var firstQueryModel = App.Views.QueriesView.collection.at(0);
		if (firstQueryModel)
		{
			var queryId = firstQueryModel.get("id");
			this.loadQuery(queryId);
		}
	},
	
	loadQuery: function(queryId) {
		
		this.loadDatasOfQuery(queryId);
		
		$(".queryTitre").removeClass("inactive").addClass("inactive");
		$(".queryTitre[data-id=" + queryId + "]").removeClass("inactive");
		$(".recentsParent").css("opacity", 0);
	},
	
	// Responsive des vues suite au resize de la fenêtre
	redrawViews: function() {
		this.buildView(true);
	},
	
	updateAllViews: function() {
		this.buildView(true);
	},


	// Si updateBool = true, on ne reconstruit pas les vues,
	// on se contente de mettre à jour les modèles Backbone qui gère la répartition (i.e. les propriétés : left, top, percentTop, color)

	buildView: function( updateBool ) {
		
		var itemsCollection = App.Collections.itemsCollection;
		if ( ! itemsCollection) return;
		
		// console.log("buildView", itemsCollection.length, updateBool);

		var mosaique = $(".mosaique .vue.votes");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();
		
		// console.log("buildView", mosaiqueWidth, mosaiqueHeight);

		var longGauche = this.longitudeGauche;
		var latTop = this.latitudeTop;
		
		var largCarte = this.largeurCarte;
		var hautCarte = this.longueurCarte;
		
		var latitudeTopBottom = this.latitudeBottom - latTop;
		var longitudeGaucheDroite = this.longitudeDroite - longGauche;

		// Servait à la carte Bitmap : n'est plus utilisé...
		var scaleCarteX = mosaiqueWidth  / largCarte;
		var scaleCarteY = mosaiqueHeight / hautCarte;
		var scaleCarte = Math.min( scaleCarteX, scaleCarteY );
		var carteMarginLeft, carteMarginTop;
		
		if (scaleCarte == scaleCarteX)
		{
			// La carte est calée sur la largeur
			// On doit centrer en hauteur
			carteMarginLeft = 0;
			carteMarginTop = (mosaiqueHeight - hautCarte * scaleCarte) / 2;
		}
		else
		{
			// La carte est calée sur la hauteur
			// On doit centrer en largeur
			carteMarginLeft = (mosaiqueWidth - largCarte * scaleCarte) / 2;
			carteMarginTop = 0;
		}
		
	
		//
		// Calculs des positions des items sur les mosaïques
		//
		
		// 1. On doit trouver :
		// - les minimums et maximum des votes (axe des y)
		// - les minimums et maximum des dates (axe des x)
		
		var listeDates = [];
		var listeResultats = [];
		var listeKeywords = [];
		var listeItemsForKeyword = []; // tableau associatif
		var listeUsers = [];
		var listeUserIds = [];
		var listeUserAssoc = [];
		var date, user, userId;


		
		itemsCollection.each(function(item)
		{
			//
			// Date et Vote : 
			//
			
			date = item.get("setDate");
			if (date == null)
			{
				// Fausse date d'après l'id de l'item
				date = getDefaultDate(item);
			}
			
			item.set("date", date)
				
			listeDates.push(date)
			listeResultats.push(item.get("rate"));
			
			if (updateBool != true)
			{
				//
				// Utilisateur :
				//
				
				user = item.get("user");
				userId = user.get("id");
				
				// console.log("userId", userId, user);
				
				if (listeUserIds.indexOf(userId) == -1)
				{
					listeUserIds.push(userId);
					listeUsers.push(user);
					listeUserAssoc[userId] = user;
				}
				
				// On stocke dans l'utilisateur la liste des items associés
				var userOfItem = listeUserAssoc[userId];
				if ( userOfItem.get("items") == null)
				{
					userOfItem.set("items", [ item ]);
				}
				else 
				{
					userOfItem.get("items").push(item);
				}
				
				//
				// Mots-clés
				//
				
				var metaCollection = item.get("metas");
				var metaContent;
				
				metaCollection.each(function(meta)
				{
					if (meta.get("name") == "KeyWord")
					{
						metaContent = meta.get("content");
						
						if (listeItemsForKeyword[metaContent] == null)
						{
							listeItemsForKeyword[metaContent] = [];
							listeKeywords.push(meta);
						}
						
						listeItemsForKeyword[metaContent].push(item);
					}
				});
				
				//
				// Positions sur la carte
				//
				
				var percentX = 0, percentY = 0;
				
				var cartos = item.get("cartos");
				if (cartos)
				{
					var sy = cartos.get("y");
					if (sy) {
						var cy = parseFloat(sy);
						if (cy != 0)
						{
							item.set("longitude", cy);
							percentX = (cy - longGauche)/longitudeGaucheDroite;
							
							var sx = cartos.get("x");
							var cx = parseFloat(sx);
							if (cx != 0) {
								item.set("latitude", cx);
								percentY = (cx - latTop)/latitudeTopBottom;
							}
						}
					}
				}
				
				var margin = 40;
				
				var left = percentX * largCarte;
				left = Math.max(margin, left);
				left = Math.min(largCarte - margin, left);
				left = Math.floor(left);
				
				var top = percentY * hautCarte;
				top = Math.max(margin, top);
				top = Math.min(hautCarte - margin, top);
				top = Math.floor(top);
				
				// console.log("cartos", cartos.get("y"), percentX, longGauche, "=", left, "/", cartos.get("x"), percentY, latTop, "=", top);
					
				item.set("mapTop", top);
				item.set("mapLeft", left);
				
			} // fin du test : updateBool != true
		});

		
		var n = listeDates.length;
		if (n > 0) {
			
			// On trie les 2 listes 	
			listeDates.sort();		
			listeResultats.sort( function sortNumber(a,b) { return a - b });

			var dateMin = listeDates[0];
			var dateMax = listeDates[n - 1];
	
			// console.log(dateMin, dateMax);
	
			var dateMinObj = iso8601ToDate(dateMin);
			var dateMaxObj = iso8601ToDate(dateMax);
			
			var dayMin = dateMinObj.getDate();
			var dayMax = dateMaxObj.getDate();
			var monthNoMin = dateMinObj.getMonth() + 1;
			var monthNoMax = dateMaxObj.getMonth() + 1;
			var yearMin = dateMinObj.getFullYear();
			var yearMax = dateMaxObj.getFullYear();
			
			monthNoMin = (monthNoMin < 10 ? "0" : "") + monthNoMin;
			monthNoMax = (monthNoMax < 10 ? "0" : "") + monthNoMax;
			
			$(".recents.dring2016 .right").html( [dayMin, monthNoMin, yearMin].join("/") );
			$(".recents.dring2016 .left").html( [dayMax, monthNoMax, yearMax].join("/") );
			$(".recentsParent").css("opacity", 1);
			
			var timeMin = dateMinObj.getTime();
			var timeMax = dateMaxObj.getTime();
			
			var voteMin = parseInt(listeResultats[0]);
			var voteMax = parseInt(listeResultats[n - 1]);
		}
		
		// console.log(timeMin, timeMax);
		// console.log(voteMin, voteMax);

		
		// 2. On peut déterminer la position théorique des points sur la Mosaïque Cool/Pas Cool:
		
		var percentX, percentY, percentAbs;
		var date, vote;

		var marginLeft = 150;
		var marginRight = 30;
		var marginTop = 60;
		
		var w = mosaiqueWidth - (marginLeft + marginRight);
		var h = mosaiqueHeight - 2 * marginTop;
		var dh = h/2;
		
		var n = listeDates.length;
		var left;
		var top;
	
	
		// Calcul de la position du la mosaïque Cool/Pas Cool
		
		itemsCollection.each(function(item)
		{
			var date = item.get("date");
			var positionDate = listeDates.indexOf(date);
			var percentX = positionDate / n;
			var left = marginLeft + w * (1 - percentX);
			
			var percentY; // Sur la demi-hauteur (des votes positifs ou négatifs)
			var percentTop; // Sur l'ensemble de la hauteur
			
			item.set("left", Math.floor(left));
			
			var vote = item.get("rate");
			if (vote >= 0)
			{
				// percentY   : de 0 à 1 (voteMax)
				// percentTop : de 0.5 à 1 (voteMax)
				
				if (voteMax == 0)
				{
					// Evite la division par zéro
					percentY = 0;
				}	
				else
				{
					percentY = vote / voteMax;
				}
				
				top = dh * (1 - percentY) + marginTop;
				percentTop = (percentY + 1) / 2;
			}
			else
			{
				// percentY   : de 0   à 1 (voteMin) 
				// percentTop : de 0.5 à 0 (voteMin) 
				
				if (voteMin == 0)
				{
					// Evite la division par zéro
					percentY = 0;
				}	
				else
				{
					percentY = vote / voteMin;
				}
				
				top = dh + dh * Math.min(1, percentY) + marginTop;
				percentTop = (1 - percentY) / 2;
			}
			
			// console.log(item.get("id"), "vote", vote, "voteMax", voteMax, "voteMin", voteMin, "percentY", percentY);
			
			item.set("percentTop", percentTop); // sert au calcul de la couleur
			item.set("top", Math.floor(top));
		});
	
		if (updateBool != true)
		{
		
			// 1) Construction de l'écran des cool/pas cool
			if (App.Views.ItemsView) App.Views.ItemsView.close();
			App.Views.ItemsView = new Chatanoo.CoolPasCoolView(itemsCollection);
	
	
			// 2) Construction de l'écran des users
			var userCollection = new UsersCollection();
			userCollection.add(listeUsers);
			
			if (App.Views.UsersView) App.Views.UsersView.close();
			App.Views.UsersView = new Chatanoo.UsersView(userCollection);
	
	
			// 3) Construction de l'écran des mots-clés
			var keywordsCollection = new MetaCollection();
			keywordsCollection.add(listeKeywords);
	
			keywordsCollection.each(function(meta) {
				var metaContent = meta.get("content");
				meta.set("items", listeItemsForKeyword[metaContent]);
			});
			
			if (App.Views.KeywordsView) App.Views.KeywordsView.close();
			App.Views.KeywordsView = new Chatanoo.KeywordsView(keywordsCollection);		
			
			
			// 4) Construction de l'écran de la carte
			if (0) {
				
				//
				// Ancienne version : cas d'une Carte Bitmap
				//
				
				if (App.Views.MapItemsView) App.Views.MapItemsView.close();
				App.Views.MapItemsView = new Chatanoo.MapItemsView(itemsCollection);
				
				var mapElement = $(App.Views.MapItemsView.$el);
				
				var mapScale = "scale(" + scaleCarte + ")";
				var mapScaleOrigin = "0% 0%";
				
				mapElement.css("width", mosaiqueWidth);
				mapElement.css("height", mosaiqueHeight);
				
				mapElement.css("margin-left", carteMarginLeft + "px");
				mapElement.css("margin-top", carteMarginTop + "px");
				
				mapElement.css("-moz-transform", mapScale);
				mapElement.css("-webkit-transform", mapScale);
				mapElement.css("-o-transform", mapScale);
				mapElement.css("transform", mapScale);
		
				mapElement.css("-moz-transform-origin", mapScaleOrigin);
				mapElement.css("-webkit-transform-origin", mapScaleOrigin);
				mapElement.css("-o-transform-origin", mapScaleOrigin);
				mapElement.css("transform-origin", mapScaleOrigin);
				
			} else {
				
				//
				// Carte Leaflet : OpenStreetMap, GoogleMap, etc...
				//
				
				if (App.Views.MapItemsView) App.Views.MapItemsView.close();
				
				// Paramètres de la carte
				var mapParams = { latitude: this.latitudeGMaps, longitude: this.longitudeGMaps, zoom: this.zoomGMaps };
				
				App.Views.MapItemsView = new Chatanoo.LeafletMapItemsView(itemsCollection, mapParams);
				
				var mapElement = $(App.Views.MapItemsView.$el);
			}
		}
	},

	openTooltipItem: function(itemId, titre, position) {
		
		var parentToolTip = $(".global");
		
		var tooltipEl = $(".tooltip", parentToolTip);
		if (tooltipEl.length == 0) {
			parentToolTip.append("<div class='tooltip'>" + titre + "</div><div class='perso-over-hilite'></div>");
		}
		
		var parentWidth = parentToolTip.width();
		var parentHeight = parentToolTip.height();

		// Effet Hilite autour des persos
		
		var isUserTab = $("#users").css("display") == "block";
		var topMargin = -20;
		
		var hiliteEl = $(".perso-over-hilite", parentToolTip);
		hiliteEl.css("left", (position.left - 32) + "px");
		hiliteEl.css("top", (position.top + topMargin) + "px");
		
		// Titre du témoignage (cartouche jaune)
		
		tooltipEl = $(".tooltip", parentToolTip);
		
		var toolTipWidth  = tooltipEl.width();
		var toolTipHeight = tooltipEl.height();
		
		var positionLeft = position.left - toolTipWidth * 0.5;
		var positionTop = position.top - 60 - toolTipHeight * 0.5;
		
		if (positionLeft + toolTipWidth > parentWidth) {
			tooltipEl.css("right", "0px");
		} else {
			tooltipEl.css("left", positionLeft + "px");
		}
		
		tooltipEl.css("top", positionTop + "px");
	},
	
	closeTooltipItem: function(itemId, titre, position) {
		var parentToolTip = $(".global");
		
		var hiliteEl = $(".perso-over-hilite", parentToolTip);
		hiliteEl.remove();
		
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.remove();
	},
	

	// --------------------------------------------------
	//
	// Player
	//
	// --------------------------------------------------
	
	openMediaItem: function(itemId, motCle, motCle1, motCle2, motCle3, title, userPseudo, endCallaback) {
		
		// console.log("openMediaItem", itemId);
		
		App.Collections.itemsCollection.each( function(model) {
			model.set("current", false);
		});
		
		var itemModel = App.Collections.itemsCollection.findWhere( { id: itemId });
		if (itemModel) {
			itemModel.set("visited", true);
			itemModel.set("current", true);
		}
		
		var stringId = String(itemId);
		
		$(".perso").each(function(index){
			var persoId = $(this).attr("id");
			if (persoId == stringId) {
				$(this).attr("class", "perso perso" + persoId + " current").attr("visited", "1");
			} else if ($(this).attr("visited") == "1") {
				$(this).attr("class", "perso visited perso" + persoId );
			} else {
				$(this).attr("class", "perso perso" + persoId );
 			}
		});

		var popupView = this.prepareMediaPlayer(280, 200);
		this.openMediaItemInPlayer(popupView, itemId, motCle, motCle1, motCle2, motCle3, title, userPseudo, endCallaback);
		this.loadComments(itemId);
	},
	
	prepareMediaPlayer: function( playerWidth, playerHeight ) {
			
		var t = this;
		var popUp;
		
		var popUpElement = $(".popup .popupContent");
		if (popUpElement.length > 0) {
			
			// La fenêtre du player est encore présente
			popUp = this.popupPlayer;
			
		} else {
		
			// Création de la fenêtre du player
			var popUpElement = $("#popup");
			popUpElement.css("display", "block");
			
			popUp = new Chatanoo.CoolPasCoolPopUpView( { el : popUpElement } );
			popUp.choix1 = this.choix1;
			popUp.choix2 = this.choix2;
			popUp.render()
			
			this.popupPlayer = popUp;
		}
		
		return popUp;
	},

	loadComments: function(itemId) {

		var t = this;
		
		var success = function(jsonResult) {
			
			// Collection des commentaires de l'item
			var commentCollection = new CommentCollection( jsonResult );
			
			var itemModel = App.Collections.itemsCollection.findWhere( { id: itemId });
			if (itemModel) itemModel.set("comments", commentCollection);
			
			// Mise à jour de la vue des commentaires dans le player
			if (App.Views.CommentsView) App.Views.CommentsView.close();
			App.Views.CommentsView = new Chatanoo.CommentsView(commentCollection);
			
			// Chargement de la données du vote pour chaque commentaire
			commentCollection.each ( function( commentModel)
			{
				var commentId = commentModel.get("id");
				
				var rateCommentSuccess = function(jsonResult) {
					
					var votes = jsonResult.Vote;
					if (votes && votes.length > 0)
					{
						var vote = votes[0];
						var voteId = vote.id;
						var rate = vote.rate;
						
						commentModel.set("rate", rate);
						
						// console.log( "rateCommentSuccess", itemId, commentId, voteId, rate );
					}
				}
			
				t.fetchDataOfCommentOfItem(commentId , itemId, rateCommentSuccess);
			});
		}
		
		t.fetchCommentsOfItem(itemId, success)
	},
	
	
	// --------------------------------------------------
	//
	// Vote
	//
	// --------------------------------------------------

	voteMediaItem: function(itemId, vote) {
		
		var t = this;
		var commentaire = $("#newComment").val();
		
		// TODO Bloquer les boutons de vote et le champ textarea
		
		// TODO : ajouter la référence à l'user si il est connecté
		var commentJson = {"content":commentaire, "items_id":0, "isValid":false, "id":0, "users_id":0, "addDate":null, "setDate":null, "__className":"Vo_Comment"};

		var addCommentSuccess = function(jsonResult) {

			var commentId = jsonResult;
			
			// TODO : ajouter la référence à l'user si il est connecté
			var voteJson = {"__className":"Vo_Data_Vote", "rate":vote, "id":0, "users_id":0, "addDate":null, "setDate":null};
		
			var addVoteToCommentSuccess = function(jsonResult) {
				
				var voteId = jsonResult;
			
				var getRateOfToItemSuccess = function(jsonResult) {
					
					var rateOfItem = parseInt(jsonResult);
					
					// Mise à jour de l'item
					var itemModel = App.Collections.itemsCollection.findWhere( { id: itemId });
					if (itemModel) itemModel.set("rate", rateOfItem);
				
					// Rechargement des commentaires de l'item en cours
					t.loadComments(itemId);
					
					// TODO : mettre à jour la liste (plutôt que la remplir à nouveau) // ou la vider avant de la remplir
					// TODO : la caler à la fin
					
					// Mettre à jour la mosaïque Cool/Pas Cool (et les couleurs des persos)
					t.updateAllViews();
		
					// TODO Débloquer les boutons de vote et le champ textarea (le vider)
				};
				
				// Récupération du "rate de l'item
				t.getRateOfToItem(itemId, getRateOfToItemSuccess);		
			};
	
			// Envoi du vote associé au commentaire
			t.addVoteToComment(voteJson, commentId, vote, itemId, addVoteToCommentSuccess);
		};
		
		// Envoi du texte du commentaire
		t.addCommentToItem(itemId, commentJson, vote, addCommentSuccess);
	},

	// --------------------------------------------------
	//
	// Upload
	//
	// --------------------------------------------------

	initUploadKeywordSelect: function( queryKeyWordCollection ) {

		var t = this;
		t.uploadKeyWordId = null;
		t.uploadKeyWordContent = null;
		
		// Liste des mots-clés de la question :
		var keywordsParent = $("#formKeywords");
		$(".keyword", keywordsParent).off();
		keywordsParent.html("");
		
		queryKeyWordCollection.each( function (keyword)
		{
			var keywordId = keyword.get("id");
			var keywordTitle = keyword.get("content");
			
			keywordsParent.append("<div class='keyword' data-id='" + keywordId + "'>" +  keywordTitle +"</div>");
		});

		$(".keyword", keywordsParent).off().on("click", function() {
			
			var keywordElement = $(this);
			var keywordId = keywordElement.data("id");
			var keyword = queryKeyWordCollection.findWhere ( { id : keywordId + "" } );
			
			var keywordTitle = $(this).text();
			keywordTitle = keywordTitle.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			
			$(".keyword").removeClass("selected");
			$(this).addClass("selected");
			
			// On fait apparaître le bouton suite
			t.displayButtonToValidateUploadKeyWord(keywordId, keywordTitle);

		});
	
	},	

});

