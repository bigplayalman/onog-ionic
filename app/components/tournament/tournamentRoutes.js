angular.module('BattleZone').config(tournamentRoutes);

function tournamentRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tournament', {
      url: '/tournament',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('tournament.ladder', {
      url: '/ladder/:id/',
      templateUrl: 'tournament/details/ladder-details.html',
      controller: 'ladderDetailsCtrl'
    });
}
