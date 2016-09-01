import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

submitForms = function() {
	console.log("it's working pt 2");
};

Meteor.subscribe('topUsers');
Meteor.subscribe('allMatches');

/********** Header Page ************/
Template.header.helpers({
	loginClicked: function() {
		return Session.get('login');
	},
	createAccountClicked: function() {
		return Session.get('createaccount');
	}
});

Template.header.events({
	'click .logout-item': function(event){
		event.preventDefault();

		Meteor.logout();
	},
	'click .login-item': function(event) {
		var flag = Session.get('login');
		if (flag != null) {
			Session.set('createaccount', false);
			Session.set('login', !flag)
		}
		else {
			Session.set('login', true);
		}
	},
	'click .createaccount-item': function() {
		var flag = Session.get('createaccount');
		if (flag != null) {
			Session.set('login', false);
			Session.set('createaccount', !flag);
		}
		else {
			Session.set('createaccount', true);
		} 
	}
});

/********** Main Page **************/
Template.main.helpers({
	recentMatches: function() {
		return Matches.find({}, {sort: {Date: -1}});
	},
	topPlayers: function() {		
		return Meteor.users.find({}, {sort: {"profile.rating": -1}}).map(function(player, index) {
			player.profile.rank = index+1;
			return player;
		});
	}
});

Template.displayScore.helpers({
});

Template.register.events({
	'submit form': function() {
		event.preventDefault();
	},
});

Template.register.onCreated(function(){
	console.log("The 'register' template was just created.");
});

Template.register.onRendered(function(){
	console.log("The 'register' template was just rendered.");
	var validator = $('.register').validate({
		submitHandler: function(event) {
			var email = $('[name=email]').val();
			var password = $('[name=password]').val();
			Accounts.createUser({
				email: email,
				password: password

			}, function(error){
				if(error) {
					if(error.reason == "Email already exists."){
						validator.showErrors({
							email: "That email already belongs to a registered user."   
						});
					}
					else {

					}
				};
			});
		}
	});
});

Template.register.onDestroyed(function(){
	if (Meteor.user()) {
		Meteor.users.update(Meteor.userId(), {$set: {
			"profile.rating": 200,
			"profile.displayname": Meteor.user().emails[0].address 
		}});
	}
	console.log("The 'register' template was just destroyed.");
	Session.set('createaccount', false);
});

Template.login.onCreated(function(){
	console.log("The 'login' template was just created.");
});

Template.login.onRendered(function(){
	console.log("The 'login' template was just rendered.");
	var validator = $('.login').validate({
		submitHandler: function(event) {
			var email = $('[name=email]').val();
			var password = $('[name=password]').val();
			Meteor.loginWithPassword(email, password, function(error) {
				if (error) {
					if(error.reason == "User not found"){
						validator.showErrors({
							email: "That email doesn't belong to a registered user."   
						});
					}
					if(error.reason == "Incorrect password"){
						validator.showErrors({
							password: "You entered an incorrect password."    
						});
					}
				}
			});
		}
	});
});

Template.login.onDestroyed(function(){
	console.log("The 'login' template was just destroyed.");
	Session.set('login', false);
});

Template.login.events({
	'submit form': function(event){
		event.preventDefault();
	},
});

Meteor.subscribe('allUsers');

/********* Profile Page *********/
Template.profileMain.helpers({
	'opponentMatch': function() {
	    var key = Session.get('searchKey');
	    if (key == null || key == "") {
	      return;
	    }
	    var query = new RegExp("^" + key, 'i');
	    var opponents = Meteor.users.find(
      		{$and: [
      			{_id: {$ne: Meteor.userId()}},
  				{'profile.displayname': query}
      		]},
      		{sort: {'profile.displayname': 1}}).map(function(opp) {
      			opp.email = opp.emails[0].address;
      			return opp;
      		});
	    var query2 = new RegExp(key, 'i');
	    var opponents = opponents.concat(Meteor.users.find(
      		{$and: [
      			{_id: {$ne: Meteor.userId()}},
  				{$and: [
      				{'profile.displayname': {$not: query}},
	      			{$or: [
	      				{'profile.displayname': query2},
	      				{'emails.address': query2}
	      			]}
      			]}
      		]},
      		{sort: {'profile.displayname': 1}}).map(function(opp) {
      			opp.email = opp.emails[0].address;
      			return opp;
      		}));
	    return opponents;
	},
	'oppEntry': function() {
		var opp = Session.get('opponent');
		return opp.profile.displayname + " (" + opp.emails[0].address + ")";
	},
});

Template.profileMain.events({
	'keyup #opponent-searchbar': function(e) {
    	Session.set('searchKey', e.target.value);
		Session.set('opponent', undefined);
	},
	'submit .start-match': function(e) {
		var opp = Session.get('opponent');
		if (!opp) {
			alert("No player selected");
			return false;
		}
		var id = Matches.insert({
			p1: Meteor.user(),
			p2: opp,
			date: new Date(),
			completed: "false",
			games: [{points1: 0, points2: 0, num: 1}],
		});
		Session.set('currentMatchId', id);
		Router.go('newmatch');
		return false;
	}
});

Template.opponentEntry.events({
	'click .opponentEntry': function(e) {
		var opp = Meteor.users.findOne({'emails.address': e.target.getAttribute('email')});
		Session.set('opponent', opp);
	}
});

Template.profileHeader.helpers({
	editClicked: function() {
		return Session.get('editButtonClicked');
	}
});

Template.profileHeader.events({
	'click .editbutton': function(e) {
		var flag = Session.set('editButtonClicked', true);		
	},
	'submit .edit-display-name': function(e) {
		Session.set('editButtonClicked', false);
		Meteor.users.update(Meteor.userId(), {$set:{"profile.displayname": e.target.name.value}});
		return false;
	}
});

Template.scoreInput.helpers({
	name1: function() {
		return Meteor.user().profile.displayname;
	},
	name2: function() {
		return Session.get('opponent').profile.displayname;
	},
	games: function() {
		return  Matches.findOne({_id: Session.get('currentMatchId')}).games;
	}
});

Template.scoreInput.events({
	'click button[type="submit"]': function(e) {
		if (e.target.id == "btn-done") {
			Matches.update({_id: Session.get('currentMatchId')}, {$set: {completed: true}});
			Meteor.call('calculate-rating', Session.get('currentMatchId'));
			Router.go('profile');
		} else if (e.target.id == "btn-delete") {
			Matches.remove({_id: Session.get('currentMatchId')});
			Router.go('profile');
		} else if (e.target.id == "btn-add") {
			var num = Matches.findOne({_id: Session.get('currentMatchId')}).games.length + 1;
			Matches.upsert({_id: Session.get('currentMatchId')}, {$push: {games: {points1: 0, points2: 0, num: num}}});
		}
		return false;
	}
});

Template.pointInput.events({
	'change .point-input': function(e) {
		var gameNum = Template.currentData().num;
		if (e.target.name == "p1") {
			Meteor.call('matches.update', Session.get('currentMatchId'), gameNum, 1, e.target.value);
		} else if (e.target.name == "p2") {
			Meteor.call('matches.update', Session.get('currentMatchId'), gameNum, 2, e.target.value);
		}
	}
});


