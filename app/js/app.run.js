angular.module('ONOG')
  .constant("moment", moment)
  .run(run);

function run ($ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup, locationServices, $ionicHistory, $cordovaNetwork) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    var type = $cordovaNetwork.getNetwork();

    var isOnline = $cordovaNetwork.isOnline();

    var isOffline = $cordovaNetwork.isOffline();
    
    console.log(isOffline);
    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      var onlineState = networkState;
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      var offlineState = networkState;
      $ionicPopup.alert({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
        .then(function(result) {
          ionic.Platform.exitApp();
        });
      
    })


    $rootScope.$on('show:loading', function() {
      $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spinner-calm"></ion-spinner>', showBackdrop: true, animation: 'fade-in'});
    });

    $rootScope.$on('hide:loading', function() {
      $ionicLoading.hide();
    });

    $ionicPlatform.on('resume', function(){
      //rock on
      $state.go('app.dashboard', {reload: true});
    });


    if(window.ParsePushPlugin) {
      console.log('new version 1');
      ParsePushPlugin.on('receivePN', function(pn){
        console.log(pn);
        if(!pn.title) {
          $ionicPopup.alert({
            title: 'Announcement',
            template: '<div class="text-center">'+ pn.alert + '</div>'
          }).then(function(res) {

          });
        } else {
          switch (pn.title) {
            case 'Opponent Found':
              $state.go('app.dashboard', {reload: true});
              break;
            case 'Opponent Confirmed':
              $state.go('app.dashboard', {reload: true});
              break;
            case 'Results Entered':
              $ionicPopup.alert({
                title: 'Match Played',
                template: '<div class="text-center">Results have been submitted</div>'
              }).then(function(res) {
                $state.go('app.dashboard', {reload: true});
              });
              break;
          }
        }
      });
    }

    locationServices.getLocation().then(function (location) {
      locationServices.setLocation(location);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.dashboard');
    }, function (err) {
      if(navigator && navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
    });

  });
}
