import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

PlayersList = new Mongo.Collection('playersList');
Meteor.subscribe('topUsers');

Template.main.helpers({
	topPlayers: function() {
		//Meteor.subscribe('allEmails');
		
		return Meteor.users.find();
	}
});



