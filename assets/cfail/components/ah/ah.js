(function() {

  if (window.ah) return;

  window.ah = {};


//  holding queues allow lazy initialization
  var holding_queues = {};

  function makeHoldingQueue(name) {
    if (ah[name]) return;

    holding_queues[name] = [];
    ah[name] = function() { holding_queues[name].push(arguments); };
  }

  ah.flushHoldingQueue = function(name, fn) {
    for (var ii = 0; ii < holding_queues[name].length; ii++) {
      fn.apply(null, holding_queues[name][ii]);
    }
    holding_queues[name] = {};
  };


  makeHoldingQueue('install');
  makeHoldingQueue('behavior');
  makeHoldingQueue('install-init');

  makeHoldingQueue('addComponentMetadata');

  window['__DEV__'] = window['__DEV__'] || 0;


}());