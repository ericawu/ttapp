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