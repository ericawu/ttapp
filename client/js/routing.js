BlazeLayout.setRoot('body');

function route_page(page_name) {
  return function(params, queryParams) {
    var pc = document.getElementById("page_container");
    if (pc) pc.classList.add("page-transition");
    setTimeout(function() {
      Session.delete('param-id');
      if (pc) pc.classList.remove("page-transition");
      BlazeLayout.render('wrapper', {body: page_name});
      Session.set('param-id', params._id);
    }, 500)
  }
}

FlowRouter.route('/', {
  name: 'home',
  action: route_page('home_page')
});

FlowRouter.route('/profile/:_id', {
  name: 'profile',
  action: route_page('profile_page')
});

FlowRouter.route('/players', {
  name: 'players',
  action: route_page('players_page')
});

FlowRouter.route('/matches', {
  name: 'matches',
 action: route_page('matches_page')
});

// FlowRouter.route('/match/:_id', {
//   name: 'match',
//  action: route_page('match_page')
// });

FlowRouter.route('/newmatch', {
  name: 'newmatch',
  action: route_page('newmatch_page')
});

FlowRouter.notFound = {
  action: route_page('notfound_page')
}