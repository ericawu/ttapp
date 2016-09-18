import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('topUsers');
Meteor.subscribe('allUsers');
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
		FlowRouter.go('home');
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
Template.home_page.helpers({
	currentMatches: function() {
		return Matches.find({completed: false}, {sort: {date: -1}});
	},
	noCurrentMatches: function() {
		return Matches.find({completed: false}, {sort: {date: -1}}).count() == 0;
	},
	recentMatches: function() {
		return Matches.find({completed: true}, {sort: {date: -1}, limit: 6});
	},
	noRecentMatches: function() {
		return Matches.find({completed: true}, {sort: {date: -1}}).count() == 0;
	},
	topPlayers: function() {		
		return Meteor.users.find({}, {sort: {"profile.rating": -1}, limit: 5}).map(function(player, index) {
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
		var match = Template.parentData(1);
		if (!match.completed) {
			return false;
		}
		var games = match.games;
		var counter = 0;
		console.log("displayScore.helpers");
		if (games != null) {
			for (var i = 0 ; i < games.length; i++) {
				if (greater(games[i].points1, games[i].points2)) {
					counter++;
				} else if (greater(games[i].points2, games[i].points1)) {
					counter--;
				}
			}
		}
		return counter > 0;
	},
	'p2win': function() {
		var match = Template.parentData(1);
		if (!match.completed) {
			return false;
		}
		var games = match.games;
		var counter = 0;
		console.log("p2win");
		if (games != null) {
			for (var i = 0 ; i < games.length; i++) {
				if (greater(games[i].points1, games[i].points2)) {
					counter++;
				} else if (greater(games[i].points2, games[i].points1)) {
					counter--;
				}
			}
		}
		return counter < 0;
	},
	'dateString': function() {
		var date = Template.currentData().date;
		// return date.getHours() + ":" + date.getMinutes() + " \u2013 " + (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
		return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
	}
});

Template.displayPoints.helpers({
	'isGreater': function(x, y) {
		return greater(x, y);
	},
	'isFirst': function(num) {
		return num == 1;
	},
	'gameFinished': function() {
		console.log("displayPoints.helpers");
		var match = Template.parentData(1);
		var gameNum = Template.currentData().num;
		return match.completed || gameNum != match.games.length;
	}
});

Template.register.events({
	'submit form': function() {
		event.preventDefault();
	},
});

Template.register.onRendered(function(){
	$.validator.addMethod("validName", function(value, element) {
		console.log("register.onRendered");
		var name = value.split(" ");
		if (name.length != 2 || !name[0].length || !name[1].length) {
			return false;
		}
		return true;
	}, "Name must be in form 'Firstname Lastname'");
	var validator = $('.register').validate({
		submitHandler: function(event) {
			var email = $('[name=email]').val();
			var password = $('[name=password]').val();
			var name = $('[name=name]').val();
			var splitName = name.split(" ");
			Accounts.createUser({
				email: email,
				password: password,
				profile: {
					fname: splitName[0],
					lname: splitName[1],
					rating: 200,
					profpic: "default.jpg"
				}
			}, function(error){
				if(error) {
					if (error.reason == "Email already exists."){
						validator.showErrors({
							email: "That email already belongs to a registered user."   
						});
					} else if (error.reason =="Name must be in form 'Firstname Lastname'") {
						validator.showErrors({
							name: error.reason
						});
					} else {
						console.log(error);
					}
				};
			});
		},
		rules: {
			name: {validName: true}
		}
	});
});

Template.register.onDestroyed(function(){
	Session.set('createaccount', false);
});


Template.login.onRendered(function(){
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
	Session.set('login', false);
});

Template.login.events({
	'submit form': function(event){
		event.preventDefault();
	},
});

/********* Profile Page *********/
Template.profile_page.onCreated(function() {
	Session.set('searchKey', undefined);
	Session.set('opponent', undefined);
	Session.set('oppSelected', false);
	Session.set('searchLength', 0);
	Session.set('oppNum', 0);
	
});

Template.profile_page.helpers({
});

Template.profile_info.helpers({
	user: function() {
		var id = Session.get('param-id') || FlowRouter.getParam('_id');
		return Meteor.users.findOne({_id: id});
	},
	isUser: function(user) {
		return user && user._id && Meteor.userId() == user._id;
	}
});

Template.profile_info.events({
	'blur .profile-name': function(e) {
		var name = e.target.value.split(" ");
		console.log("profile_info");
		if (name.length != 2 || !name[0].length || !name[1].length) {
			e.target.value = Meteor.user().profile.fname + " " + Meteor.user().profile.lname;
			return false;
		}
		Meteor.users.update(Meteor.userId(), {$set:{"profile.fname": name[0], "profile.lname": name[1]}});
		return false;
	},
	'change .profile-name': function(e) {
		e.target.blur();
	}
});

Template.newmatchBar.helpers({
	'opponentMatch': function() {
	    var key = Session.get('searchKey');
	    if (key == null || key == "") {
	      return;
	    }
	    var query = new RegExp("^" + key, 'i');
	    var opponents = Meteor.users.find(
      		{$and: [
      			{_id: {$ne: Meteor.userId()}},
  				{$or: [
  					{'profile.fname': query},
  					{'profile.lname': query}
  				]}
      		]},
      		{sort: {'profile.fname': 1, 'profile.lname': 1}}).map(function(opp) {
      			opp.email = opp.emails[0].address;
      			return opp;
      		});
	    var query2 = new RegExp(key, 'i');
	    var opponents = opponents.concat(Meteor.users.find(
      		{$and: [
      			{_id: {$ne: Meteor.userId()}},
  				{$and: [
	  				{$and: [
	  					{'profile.fname': {$not: query}},
	  					{'profile.lname': {$not: query}}
	  				]},
	      			{$or: [
	      				{'profile.fname': query2},
	      				{'profile.lname': query2},
	      				{'emails.address': query2}
	      			]}
      			]}
      		]},
      		{sort: {'profile.fname': 1, 'profile.lname': 1}}).map(function(opp) {
      			opp.email = opp.emails[0].address;
      			return opp;
      		}));
	    console.log("newmatchbar");
		Session.set('oppNum', opponents.length);
	    return opponents;
	},
	'oppNum': function() {
		return Session.get('oppNum');
	},
	'oppEntry': function() {
		var opp = Session.get('opponent');
		return opp ? opp.profile.fname + " " + opp.profile.lname + " (" + opp.emails[0].address + ")" : "";
	},
	'showDropdown': function() {
		if (!Session.get('oppSelected') && Session.get('searchLength') > 0) {
			return true;
		} else {
			return false;
		}
	}
})

Template.newmatchBar.events({
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
		console.log("newmatchBar");
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
		FlowRouter.go('newmatch');
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

Template.scoreInput.helpers({
	name1: function() {
		return Meteor.user().profile.fname.charAt(0) + ". " + Meteor.user().profile.lname;
	},
	name2: function() {
		return Session.get('opponent').profile.fname.charAt(0) + ". " + Session.get('opponent').profile.lname;
	},
	games: function() {
		return  Matches.findOne({_id: Session.get('currentMatchId')}).games;
	}
});

function boNumFromGames(games) {
	var counter1 = 0;
	var counter2 = 0;
	console.log("boNumFromGames");
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
		console.log("scoreInput");
		if (e.target.id == "btn-done") {
			var games = Matches.findOne({_id: Session.get('currentMatchId')}).games;
			var fillerNum = boNumFromGames(games) - games.length;
			for (var i = 0 ; i < fillerNum; i++) {
				games.push({points1: "\u2013", points2: "\u2013", num: games.length+1, filler: true});
			}
			Matches.update({_id: Session.get('currentMatchId')}, {$set: {completed: true, games: games}});
			Meteor.call('calculate-rating', Session.get('currentMatchId'));
			Session.set('opponent', undefined);
			FlowRouter.go('home');
		} else if (e.target.id == "btn-delete") {
			Matches.remove({_id: Session.get('currentMatchId')});
			Session.set('opponent', undefined);
			FlowRouter.go('home');
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

Template.players_page.helpers({
	allPlayers: function() {		
		return Meteor.users.find({}, {sort: {"profile.rating": -1}}).map(function(player, index) {
			player.profile.rank = index+1;
			return player;
		});
	}
});

Template.uploadImage.onCreated(function() {
	Session.set('updatingImg', false);
});

//helper function isn't picking up session variable changes for some reason
Template.uploadImage.helpers({
	updateImg: function() {
		if (Session.get('updatingImg')) {
			//var x = Session.get('updatingImg');
			return "Updating Profile Picture...";
		}
		else {
			//var x = Session.get('updatingImg');
			return "Update Profile Picture";
		}
	}
});

Template.uploadImage.events({
    'change .uploadFile': function(event,template){

    	Session.set('updatingImg', true);
    	console.log(Session.get('updatingImg'));
	    var files = event.target.files;
	    var file = files[0];

	    //TODO: check file extension and number of files (only one allowed)

	    var filename = file.name;
	    console.log("file name is: " + filename);
	    
	    AzureFile.upload(
            file,"uploadFile",
            {},
            function(error,success){
                if (error) {
                	console.log("there was an error");
                	console.log(error);
                }
                else {
                	console.log("success!");
                	console.log(success);
                }
            }
        );
        Session.set('updatingImg', false);
	}
});

Template.playerRecentMatches.helpers({
	recentMatches: function() {
		var id = Session.get('param-id') || FlowRouter.getParam('_id');
		return Matches.find({$or: [{"id1": id}, {"id2": id}]}, {sort: {date: -1}, limit: 6});
	},
	noRecentMatches: function() {
		var id = Session.get('param-id') || FlowRouter.getParam('_id');
		return Matches.find({$or: [{"id1": id}, {"id2": id}]}, {sort: {date: -1}, limit: 6}).count() == 0;
	}
});









