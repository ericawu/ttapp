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

  /* Remember the method name must match the method name from the client call. The parameters passed from the client can be referenced by file.paramname */
    var response;
    if (file === void 0) {
      throw new Meteor.Error(500, "Missing File", "", "");
    }
    console.log("in server");
    console.log(file.name);
    response = file.azureUpload(file.name, "njiang", "autzeQkPG5Tg89rEtH24WWv7b8wgVWCUD3rC0OLvMZzDSxUSXko+rcJ7NT39sQDPNs2C/vXeOAZTGuwfijoFxA==", "blob-container");
    return console.log(response);
    /* Once file is completely uploaded you get a url in the response . Remember the file is uploaded in chunks so this function will be triggered multiple times. The response will contain the url parameter only if the file is completely uploaded */
  }
});