
angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

function MatchViewCtrl(
  $scope, $state, $rootScope, $ionicPopup, $ionicHistory, $timeout,
  Parse, LadderServices, MatchServices, QueueServices, cameraServices, tournament
) {
  
  var parseFile = new Parse.File();
  var imgString = null;
  
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User;
  $scope.picture = null;

  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  
  $scope.$on("$ionicView.enter", function(event) {
    $rootScope.$broadcast('show:loading');
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        $rootScope.$broadcast('hide:loading');
        $scope.match = matches[0];
        if($scope.match.get('status') === 'cancelled') {
          $scope.player.set('status', 'open');
          $scope.player.save().then(function () {
            $state.go('app.dashboard');
          });
        }
        getMatchDetails();
      });
    });
  });
  
  $scope.$on('$ionicView.leave', function(event) {
    loseMatch().close();
    winMatch().close();
  });

  $scope.getPicture = function() {
    if(cameraServices.camera) {
      var options = cameraServices.camera;
      navigator.camera.getPicture(onSuccess,onFail,options);
    }
  };
  var onSuccess = function(imageData) {
    $scope.picture = 'data:image/png;base64,' + imageData;
    imgString = imageData;
    $scope.$apply();
  };
  var onFail = function(e) {
    console.log("On fail " + e);
  };

  $scope.doRefresh = function() {
    getMatch(true);
  };

  $scope.record = function (record) {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      var username = null;
      $scope.match = matches[0];
      if($scope.match.get('status') === 'active') {
        switch (record) {
          case 'win':
            winMatch().then(function(res) {
              console.log(res);
              if(res) {
                if(imgString) {
                  parseFile = new Parse.File("winning.png", {base64:imgString});
                  $scope.match.set("winImage", parseFile);
                }
                $scope.match.set('winner', $scope.player);
                $scope.match.set('loser', $scope.opponent.user);
                username = $scope.opponent.username;
                recordMatch(username);
              }
            });
            break;
          case 'loss':
            loseMatch().then(function(res) {
              console.log(res);
              if(res) {
                $scope.match.set('winner', $scope.opponent.user);
                $scope.match.set('loser', $scope.player);
                username = $scope.opponent.username;
                recordMatch(username);
              }
            });
            break;
        }
      }
    });
  };

  function winMatch () {
    $scope.picture = null;
    $scope.errorMessage = null;

    return $ionicPopup.show(
      {
        templateUrl: 'templates/popups/win.match.html',
        title: 'Report a Win',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.picture) {
                $scope.errorMessage = 'Upload a Screenshot';
                e.preventDefault();
              } else {
                return true;
              }
            }
          }
        ]
      });
  }

  function loseMatch() {
    return $ionicPopup.show(
      {
        templateUrl: 'templates/popups/lose.match.html',
        title: 'Report a Loss',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          }
        ]
      });
  }

  function getMatch(refresh) {
    MatchServices.getMatch($scope.match.id).then(function (match) {
      $scope.match = match;
      console.log('match' + $scope.match.get('status'));
      console.log('match fetched');
      console.log($scope.match.get('winner'));
      if(refresh) {
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
  }

  function recordMatch(username) {
    $rootScope.$broadcast('show:loading');
    $scope.match.set('status', 'completed');
    $scope.match.save().then(function (match) {
      $scope.match = match;
      $timeout(function () {
        Parse.Cloud.run('matchResults', {match: $scope.match.id, username: username})
          .then(function () {
            $scope.match.winner.fetch().then(function (winner) {
              console.log(winner);
              $scope.match.winner = winner;
            })
            $rootScope.$broadcast('hide:loading');
          }, function(err) {
          alert(err.message);
          $rootScope.$broadcast('hide:loading');
        });
      }, 2000);
    });
  }

  function getMatchDetails() {
    $scope.opponent = {
      hero: null,
      battleTag: null
    };
    if($scope.player.player === 'player1') {
      $scope.opponent.hero = $scope.match.hero2;
      $scope.opponent.username = $scope.match.username2;
      $scope.opponent.battleTag = $scope.match.battleTag2;
      $scope.opponent.user = $scope.match.player2;
    }
    if($scope.player.player === 'player2') {
      $scope.opponent.hero = $scope.match.hero1;
      $scope.opponent.username = $scope.match.username1;
      $scope.opponent.battleTag = $scope.match.battleTag1;
      $scope.opponent.user = $scope.match.player1;
    }
  }
}
