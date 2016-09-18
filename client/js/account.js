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