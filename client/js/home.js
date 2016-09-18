Template.home_page.helpers({
    currentMatches: function() {
        return Matches.find({completed: false}, {sort: {date: -1}});
    },
    recentMatches: function() {
        return Matches.find({completed: true}, {sort: {date: -1}, limit: 6});
    },
    topPlayers: function() {        
        return Meteor.users.find({}, {sort: {"profile.rating": -1}, limit: 5}).map(function(player, index) {
            player.profile.rank = index+1;
            return player;
        });
    }
});