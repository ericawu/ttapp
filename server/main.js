import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  Meteor.publish('topUsers', function() {
  	return Meteor.users.find({}, {limit: 8}, {fields: {profile: 1}});
  });

  Meteor.publish('allUsers', function() {
  	return Meteor.users.find();
  })

  Meteor.publish('allMatches', function() {
  	return Matches.find();
  });
});

Meteor.methods({
  'uploadFile': function(file) {
    var response;
    if (file === void 0) {
      throw new Meteor.Error(500, "Missing File", "", "");
    }
    console.log("in server");
    console.log(file.name);
    //not secure, is there a better way to store keys?
    response = file.azureUpload(file.name, "njiang", "autzeQkPG5Tg89rEtH24WWv7b8wgVWCUD3rC0OLvMZzDSxUSXko+rcJ7NT39sQDPNs2C/vXeOAZTGuwfijoFxA==", "profpics");
    //var regex = new RegExp("^https?://");
    //regex.test(response)
    
    if (response != undefined) {
      console.log(typeof(response));
      console.log(typeof(response.url));
      console.log(response.url);

      Meteor.users.update(Meteor.userId(), {$set: {'profile.profpic': response.url}});
      console.log("matches!");
    }
    else {
      console.log("doesn't match");
    }
    
    return console.log(response);
  }
});