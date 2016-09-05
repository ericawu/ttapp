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
		Router.go('home');
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
	currentMatches: function() {
		return Matches.find({completed: false}, {sort: {date: -1}});
	},
	noCurrentMatches: function() {
		return Matches.find({completed: false}, {sort: {date: -1}}).count() == 0;
	},
	recentMatches: function() {
		return Matches.find({completed: true}, {sort: {date: -1}});
	},
	noRecentMatches: function() {
		return Matches.find({completed: true}, {sort: {date: -1}}).count() == 0;
	},
	topPlayers: function() {		
		return Meteor.users.find({}, {sort: {"profile.rating": -1}}).map(function(player, index) {
			player.profile.rank = index+1;
			return player;
		});
	}
});

function greater(x, y) {
	return parseInt(x) > parseInt(y);
}

Template.displayScore.helpers({
	'playerFromId': function(id) {
		return Meteor.users.findOne({_id: id});
	},
	'p1win': function() {
		var games = Template.currentData().games;
		var counter = 0;
		for (var i = 0 ; i < games.length; i++) {
			if (games[i].points1 > games[i].points2) {
				counter++;
			} else if (games[i].points2 > games[i].points1) {
				counter--;
			}
		}
		return counter > 0;
	},
	'p2win': function() {
		var games = Template.currentData().games;
		var counter = 0;
		for (var i = 0 ; i < games.length; i++) {
			if (games[i].points1 > games[i].points2) {
				counter++;
			} else if (games[i].points2 > games[i].points1) {
				counter--;
			}
		}
		return counter < 0;
	}
});

Template.displayPoints.helpers({
	'isGreater': function(x, y) {
		return greater(x, y);
	},
	'isFirst': function(num) {
		return num == 1;
	}
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
Template.profileMain.onCreated(function() {
	Session.set('searchKey', undefined);
	Session.set('opponent', undefined);
	Session.set('oppSelected', false);
	Session.set('searchLength', 0);
	Session.set('oppNum', 0);
});

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
		Session.set('oppNum', opponents.length);
	    return opponents;
	},
	'oppNum': function() {
		return Session.get('oppNum');
	},
	'oppEntry': function() {
		var opp = Session.get('opponent');
		return opp ? opp.profile.displayname + " (" + opp.emails[0].address + ")" : "";
	},
	'showDropdown': function() {
		if (!Session.get('oppSelected') && Session.get('searchLength') > 0) {
			return true;
		} else {
			return false;
		}
	}
});

Template.profileMain.events({
	'click #opponent-searchbar': function(e) {
		if (Session.get('oppSelected')) {
	    	Session.set('searchKey', undefined);
			Session.set('opponent', undefined);
			Session.set('searchLength', 0);
			Session.set('oppSelected', false);
		}
	},
	'keyup #opponent-searchbar': function(e) {
    	Session.set('searchKey', e.target.value);
		Session.set('opponent', undefined);
		Session.set('searchLength', e.target.value.length);
		Session.set('oppSelected', false);
	},
	'submit .start-match': function(e) {
		var opp = Session.get('opponent');
		if (!opp) {
			alert("No player selected");
			return false;
		}
		var id = Matches.insert({
			id1: Meteor.userId(),
			id2: opp._id,
			date: new Date(),
			completed: false,
			games: [{points1: "0", points2: "0", num: 1, filler: false}],
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
		Session.set('oppSelected', true);
	}
});


Template.profileHeader.helpers({
	editClicked: function() {
		return Session.get('editButtonClicked');
	},

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

function boNumFromGames(games) {
	var counter1 = 0;
	var counter2 = 0;
	for (var i = 0; i < games.length; i++) {
		if (greater(games[i].points1, games[i].points2)) {
			counter1++;
		} else {
			counter2++;
		}
	}
	return counter1 > counter2 ? counter1 * 2 - 1 : counter2 * 2 - 1;
}

Template.scoreInput.events({
	'click button[type="submit"]': function(e) {
		if (e.target.id == "btn-done") {
			var games = Matches.findOne({_id: Session.get('currentMatchId')}).games;
			var fillerNum = boNumFromGames(games) - games.length;
			for (var i = 0 ; i < fillerNum; i++) {
				games.push({points1: "\u2013", points2: "\u2013", num: games.length+1, filler: true});
			}
			Matches.update({_id: Session.get('currentMatchId')}, {$set: {completed: true, games: games}});
			Meteor.call('calculate-rating', Session.get('currentMatchId'));
			Router.go('profile');
		} else if (e.target.id == "btn-delete") {
			Matches.remove({_id: Session.get('currentMatchId')});
			Router.go('profile');
		} else if (e.target.id == "btn-add") {
			var num = Matches.findOne({_id: Session.get('currentMatchId')}).games.length + 1;
			Matches.upsert({_id: Session.get('currentMatchId')}, {$push: {games: {points1: "0", points2: "0", num: num, filler: false}}});
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

Template.allPlayers.helpers({
	allPlayers: function() {		
		return Meteor.users.find({}, {sort: {"profile.rating": -1}}).map(function(player, index) {
			player.profile.rank = index+1;
			return player;
		});
	}
})
