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
    'click .opponent-searchbar': function(e) {
        if (Session.get('oppSelected')) {
            Session.set('searchKey', undefined);
            Session.set('opponent', undefined);
            Session.set('searchLength', 0);
            Session.set('oppSelected', false);
        }
    },
    'keyup .opponent-searchbar': function(e) {
        Session.set('searchKey', e.target.value);
        Session.set('opponent', undefined);
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
            games: [{points1: "", points2: "", num: 1}],
            filler: []
        });
        Session.set('editMode', true);
        Session.set('games', Matches.findOne({_id: id}).games);
        FlowRouter.go('match', {_id: id});
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
