import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';



submitForms = function() {
	console.log("it's working pt 2");
};

Meteor.subscribe('topUsers');
//Meteor.subscribe('allMatches');

/********** Main Page **************/
Template.main.helpers({
	topPlayers: function() {
		//Meteor.subscribe('allEmails');		
		return Meteor.users.find();
	}
});

Template.displayScore.helpers({
	recentMatches: function() {
		return Matches.find({}, {sort: {Date: -1}});
	}
})

/********* Profile Page *********/
Template.profileMain.events({
	'submit .start-match': function(e) {
		console.log("submitted");
		var p2 = e.target.opponent.value;
		var id = Matches.insert({
			P1: "Player 1",
			P2: p2,
			Date: new Date(),
			completed: "false",	
			G1P1: "",
			G1P2: "",
			G2P1: "",
			G2P2: "",
			G3P1: "",
			G3P2: "",
			G4P1: "",
			G4P2: "",
			G5P1: "",
			G5P2: "",
			G6P1: "",
			G6P2: "",
			G7P1: "",
			G7P2: ""		
		});
		Session.set('currentMatch', id);
		Router.go('newmatch');	
		return false;
	}
});

Template.profileHeader.helpers({
	name: function() {
		//TODO: Return name once users are stored
		return Meteor.user().emails[0].address;
	},
});

Template.scoreInput.events({

/*
	"click input[type=submit]": function(e) {
		console.log('asdf');
		if ($(e.target).prop("id") == "btn-submit") {
			var tg1 = e.target.tg1.value;
			var bg1 = e.target.bg1.value;
			var tg2 = e.target.tg2.value;
			var bg2 = e.target.bg2.value;
			var tg3 = e.target.tg3.value;
			var bg3 = e.target.bg3.value;
			var tg4 = e.target.tg4.value;
			var bg4 = e.target.bg4.value;
			var tg5 = e.target.tg5.value;
			var bg5 = e.target.bg5.value;
			var tg6 = e.target.tg6.value;
			var bg6 = e.target.bg6.value;
			var tg7 = e.target.tg7.value;
			var bg7 = e.target.bg7.value;
			Matches.update({_id: Session.get('currentMatch')}, {$set:{
				Date: new Date(),
				completed: "true",
				G1P1: tg1,
				G1P2: bg1,
				G2P1: tg2,
				G2P2: bg2,
				G3P1: tg3,
				G3P2: bg3,
				G4P1: tg4,
				G4P2: bg4,
				G5P1: tg5,
				G5P2: bg5,
				G6P1: tg6,
				G6P2: bg6,
				G7P1: tg7,
				G7P2: bg7
			}});
			console.log("it worked");
			Router.go('home');
		}
	}
			
	'submit .score-form': function(e) {
		console.log(e);
		return false;
	}*/

	'click button[type="submit"]': function(e) {
		console.log("hiiiii");
		if ($(e.target).prop("id") == "btn-submit") {			
			var tg1 = e.target.form.tg1.value;
			var bg1 = e.target.form.bg1.value;
			var tg2 = e.target.form.tg2.value;
			var bg2 = e.target.form.bg2.value;
			var tg3 = e.target.form.tg3.value;
			var bg3 = e.target.form.bg3.value;
			var tg4 = e.target.form.tg4.value;
			var bg4 = e.target.form.bg4.value;
			var tg5 = e.target.form.tg5.value;
			var bg5 = e.target.form.bg5.value;
			var tg6 = e.target.form.tg6.value;
			var bg6 = e.target.form.bg6.value;
			var tg7 = e.target.form.tg7.value;
			var bg7 = e.target.form.bg7.value;
			Matches.update({_id: Session.get('currentMatch')}, {$set:{
				Date: new Date(),
				completed: "true",
				G1P1: tg1,
				G1P2: bg1,
				G2P1: tg2,
				G2P2: bg2,
				G3P1: tg3,
				G3P2: bg3,
				G4P1: tg4,
				G4P2: bg4,
				G5P1: tg5,
				G5P2: bg5,
				G6P1: tg6,
				G6P2: bg6,
				G7P1: tg7,
				G7P2: bg7
			}});
			console.log("submitted");
			Router.go('home');
		}
		else {
			var tg1 = e.target.form.tg1.value;
			var bg1 = e.target.form.bg1.value;
			var tg2 = e.target.form.tg2.value;
			var bg2 = e.target.form.bg2.value;
			var tg3 = e.target.form.tg3.value;
			var bg3 = e.target.form.bg3.value;
			var tg4 = e.target.form.tg4.value;
			var bg4 = e.target.form.bg4.value;
			var tg5 = e.target.form.tg5.value;
			var bg5 = e.target.form.bg5.value;
			var tg6 = e.target.form.tg6.value;
			var bg6 = e.target.form.bg6.value;
			var tg7 = e.target.form.tg7.value;
			var bg7 = e.target.form.bg7.value;
			Matches.update({_id: Session.get('currentMatch')}, {$set:{
				Date: new Date(),
				completed: "true",
				G1P1: tg1,
				G1P2: bg1,
				G2P1: tg2,
				G2P2: bg2,
				G3P1: tg3,
				G3P2: bg3,
				G4P1: tg4,
				G4P2: bg4,
				G5P1: tg5,
				G5P2: bg5,
				G6P1: tg6,
				G6P2: bg6,
				G7P1: tg7,
				G7P2: bg7
			}});
			console.log("updated db");
		}
		return false;
	}

});



