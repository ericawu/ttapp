import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

PlayersList = new Mongo.Collection('playersList');

Template.main.helpers({
	topPlayers: function() {
		console.log("test");
		return Meteor.users.find();
	}
})

