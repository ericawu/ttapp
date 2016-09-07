BlazeLayout.setRoot('body');

FlowRouter.route('/profile/:_id', {
  name: 'profile',
  action(params, queryParams) {
    BlazeLayout.render('wrapper', {body: 'profile_page'});
  }
});

FlowRouter.route('/', {
  name: 'home',
  action(params, queryParams) {
    BlazeLayout.render('wrapper', {body: 'home_page'});
  }
});

FlowRouter.route('/players', {
  name: 'players',
  action(params, queryParams) {
    BlazeLayout.render('wrapper', {body: 'players_page'});
  }
});

// FlowRouter.route('/matches', {
//   name: 'matches',
//   action(params, queryParams) {
//     BlazeLayout.render('wrapper', {body: 'matches_page'});
//   }
// });

// FlowRouter.route('/match/:_id', {
//   name: 'match',
//   action(params, queryParams) {
//     BlazeLayout.render('wrapper', {body: 'match_page'});
//   }
// });

FlowRouter.route('/newmatch', {
  name: 'newmatch',
  action(params, queryParams) {
    BlazeLayout.render('wrapper', {body: 'newmatch_page'});
  }
});