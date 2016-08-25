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
			completed: "false"			
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
	'click button[type="submit"]': function(e) {
		console.log("hiiiii");
		console.log(e);
		if ($(e.target).prop("id") == "btn-submit") {
			
		}
		else {

		}
		return false;
	}

});



