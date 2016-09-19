Template.matches_page.helpers({
    currentMatches: function() {
        return Matches.find({completed: false}, {sort: {date: -1}});
    },
    recentMatches: function() {
        return Matches.find({completed: true}, {sort: {date: -1}});
    }
});

Template.matches_display.helpers({
    noMatches: function(matches) {
        return matches.count() == 0;
    }
})