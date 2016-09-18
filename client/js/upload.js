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