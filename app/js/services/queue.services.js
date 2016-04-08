angular.module('ONOG.Services')

  .service('QueueServices', QueueServices)
  .factory('Queue', Queue);

QueueServices.$inject = ['Parse', 'Queue'];
Queue.$inject = ['Parse'];

function QueueServices(Parse, Queue) {
  var opponent = {
    list: ['Easy Pickings', 'Your Worst Nightmare', 'World class paste eater',
      'A Murloc', 'Gourd critic', 'Nose and mouth breather', 'Hogger', 'A cardish Ian',
      'Mopey Mage', 'Wombat Warlock', 'Rouged up Rogue', 'Waifish Warrior', 'Damp Druid',
      'Shabby Shaman', 'Penniless Paladin', 'Huffy Hunter', 'Perky Priest', 'The Worst Player',
      'Your Old Roommate', 'StarCraft Pro', 'Fiscally responsible mime', 'Your Guild Leader',
      'Noneck George', 'Gum Pusher', 'Cheater McCheaterson', 'Really slow guy', 'Roach Boy',
      'Orange Rhymer', 'Coffee Addict', 'Inward Talker', 'Blizzard Developer', 'Grand Master',
      'Diamond League Player', 'Brand New Player', 'Dastardly Death Knight', 'Mediocre Monk',
      'A Little Puppy'
    ]
  };
  return {
    opponent: opponent,
    checkStatus: checkStatus,
    joinQueue: joinQueue,
    cancelQueue: cancelQueue
  }

  function checkStatus(tournament, user) {
    var query = new Parse.Query(Queue.Model);
    query.equalTo('user', user);
    query.containedIn('status', ['pending', 'found']);
    query.equalTo('tournament', tournament);
    return query.find();
  }

  function joinQueue(tournament, user) {
    var queue = new Queue.Model();
    queue.set('user', user);
    queue.set('tournament', tournament);
    queue.set('status', 'pending');
    return queue.save();
  }

  function cancelQueue(cancel) {
    var queue = new Queue.Model();
    queue.id = cancel.id;
    return queue.destroy();
  }
}

function Queue(Parse) {
  var Model = Parse.Object.extend('Queue');
  var attributes = ['tournament', 'user', 'status'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
