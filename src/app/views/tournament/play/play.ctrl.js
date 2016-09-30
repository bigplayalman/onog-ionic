angular.module('BattleZone')

  .controller('playCtrl', playCtrl);

function playCtrl(
  $scope, $state, $stateParams, $ionicPopup, $timeout,
  tournamentServices, matchServices, playerServices, userServices
) {
  $scope.id = $stateParams.id;
  $scope.current = playerServices.current;
  $scope.user = userServices.user;

  if(!$scope.current.player) {
    playerServices.fetchPlayer().then(function () {
      getLatestMatch();
    });
  } else {
    getLatestMatch();
  }

  $scope.recordMatch = function (result) {
    $scope.match.fetch().then(function (match) {
      $scope.match = match;
      if(!$scope.match.get('result')) {
        matchServices.recordMatch(result, $scope.match).then(function (match) {
          $scope.match = match;
        });
      } else {
        $ionicPopup.alert({
          template: 'Match Results Already Entered',
          title: 'An error has occured'
        });
      }
    });
  }

  $scope.cancelMatch = function () {
    $scope.match.set('status', 'cancelled');
    $scope.match.save().then(function () {
      $state.go('tournament.list');
    });
  }

  function getLatestMatch() {
    matchServices.getLatestMatch($scope.id, $scope.current.player).then(function (matches) {
      if(matches.length) {
        $scope.match = matches[0];
        console.log('match found', $scope.match);
        if(!$scope.match.opponent) {
          findOpponent();
        }
      } else {
        matchServices.createMatch($scope.id, $scope.current.player).then(function (match) {
          $scope.match = match;
          console.log('new match', $scope.match);
          findOpponent();
        });
      }
    });
  }

  function findOpponent() {
    if($scope.user.current) {
      matchServices.findOpponent($scope.match).then(function (found) {
        console.log(found);
        if(found) {

        } else {
          $timeout(findOpponent, 15000);
        }
      });
    }
  }
};
