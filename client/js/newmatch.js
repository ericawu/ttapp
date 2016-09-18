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
        console.log("newmatchbar");
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
    'click #opponent-searchbar': function(e) {
        if (Session.get('oppSelected')) {
            Session.set('searchKey', undefined);
            Session.set('opponent', undefined);
            Session.set('searchLength', 0);
            Session.set('oppSelected', false);
        }
    },
    'keyup #opponent-searchbar': function(e) {
        Session.set('searchKey', e.target.value);
        Session.set('opponent', undefined);
        console.log("newmatchBar");
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
            games: [{points1: "0", points2: "0", num: 1, filler: false}],
        });
        Session.set('currentMatchId', id);
        FlowRouter.go('newmatch');
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

Template.scoreInput.helpers({
    name1: function() {
        return Meteor.user().profile.fname.charAt(0) + ". " + Meteor.user().profile.lname;
    },
    name2: function() {
        return Session.get('opponent').profile.fname.charAt(0) + ". " + Session.get('opponent').profile.lname;
    },
    games: function() {
        return  Matches.findOne({_id: Session.get('currentMatchId')}).games;
    }
});

function boNumFromGames(games) {
    var counter1 = 0;
    var counter2 = 0;
    console.log("boNumFromGames");
    for (var i = 0; i < games.length; i++) {
        if (greater(games[i].points1, games[i].points2)) {
            counter1++;
        } else {
            counter2++;
        }
    }
    return counter1 > counter2 ? counter1 * 2 - 1 : counter2 * 2 - 1;
}

Template.scoreInput.events({
    'click button[type="submit"]': function(e) {
        console.log("scoreInput");
        if (e.target.id == "btn-done") {
            var games = Matches.findOne({_id: Session.get('currentMatchId')}).games;
            var fillerNum = boNumFromGames(games) - games.length;
            for (var i = 0 ; i < fillerNum; i++) {
                games.push({points1: "\u2013", points2: "\u2013", num: games.length+1, filler: true});
            }
            Matches.update({_id: Session.get('currentMatchId')}, {$set: {completed: true, games: games}});
            Meteor.call('calculate-rating', Session.get('currentMatchId'));
            Session.set('opponent', undefined);
            FlowRouter.go('home');
        } else if (e.target.id == "btn-delete") {
            Matches.remove({_id: Session.get('currentMatchId')});
            Session.set('opponent', undefined);
            FlowRouter.go('home');
        } else if (e.target.id == "btn-add") {
            var num = Matches.findOne({_id: Session.get('currentMatchId')}).games.length + 1;
            Matches.upsert({_id: Session.get('currentMatchId')}, {$push: {games: {points1: "0", points2: "0", num: num, filler: false}}});
        }
        return false;
    }
});

Template.pointInput.events({
    'change .point-input': function(e) {
        var gameNum = Template.currentData().num;
        if (e.target.name == "p1") {
            Meteor.call('matches.update', Session.get('currentMatchId'), gameNum, 1, e.target.value);
        } else if (e.target.name == "p2") {
            Meteor.call('matches.update', Session.get('currentMatchId'), gameNum, 2, e.target.value);
        }
    }
});
