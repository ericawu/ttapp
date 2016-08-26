import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  Meteor.publish('topUsers', function() {
  	return Meteor.users.find({}, {fields: {profile: 1}});
  });

  Meteor.publish('allUsers', function() {
  	return Meteor.users.find();
  })

  Meteor.publish('allMatches', function() {
  	return Matches.find();
  });

  
});
