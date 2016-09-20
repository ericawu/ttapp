Template.profile_page.onCreated(function() {
    Session.set('searchKey', undefined);
    Session.set('opponent', undefined);
    Session.set('oppSelected', false);
    Session.set('searchLength', 0);
    Session.set('oppNum', 0);
});

Template.profile_page.helpers({
    recentMatches: function() {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        return Matches.find({$or: [{"id1": id}, {"id2": id}]}, {sort: {date: -1}, limit: 10});
    },
    heading: function() {
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        var user = Meteor.users.findOne({_id: id});
        if (!user) {
            return "";
        }
        return user.profile.fname + "'s Recent Matches";
    },
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
        if (name.length != 2 || !name[0].length || !name[1].length) {
            e.target.value = Meteor.user().profile.fname + " " + Meteor.user().profile.lname;
            return false;
        }
        Meteor.users.update(Meteor.userId(), {$set:{"profile.fname": name[0], "profile.lname": name[1]}});
        return false;
    },
    'change .profile-name': function(e) {
        e.target.blur();
    },
    'click .btn-delete-account': function(e) {
        e.preventDefault();
        $('#deleteAccountModal').modal('show');
    },
    'click .confirm-delete-account': function(e) {
        e.preventDefault();
        var id = Session.get('param-id') || FlowRouter.getParam('_id');
        Meteor.call('delete-account', id);
        $('#deleteAccountModal').modal('hide');
        FlowRouter.go('home');
    }
});