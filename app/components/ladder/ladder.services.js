
angular.module('BattleZone')

  .factory('ladderServices', ladderServices);

function ladderServices(Parse) {

  return {
    createLadder: createLadder,
    getLadder: getLadder,
    saveLadder: saveLadder,
    getLadders: getLadders,
    getStandings: getStandings
  }

  function createLadder(tourney) {
    var ladder = new Parse.Object('ladder');
    ladder.set('tournament', tourney);
    ladder.set('status', 'pending');
    return ladder.save();
  }
  function getLadder(id) {
    var ladder = new Parse.Object('ladder');
    ladder.id = id;
    return ladder.fetch();
  }
  function saveLadder(params) {
    var ladder = new Parse.Object('ladder');
    ladder.set(params);
    return ladder.save();
  }
  function getLadders() {
    var ladders = new Parse.Query('ladder');
    ladders.include('tournament');
    return ladders.find();
  }
  function getStandings(id) {
    var players = new Parse.Query('standings');
    var ladder = new Parse.Object('ladder');
    ladder.id = id;
    players.equalTo('ladder', ladder);
    return players.find();
  }

}