var _ = require('lodash');
var dgram = require('dgram');
var util = require('util');
var debug = require('debug')('jt.haw');
var stats = require('./stats');
exports.start = start;

/**
 * [start 启动udp log收集server]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function start(options){
  options = _.extend({
    port : 6000,
    host : '127.0.0.1'
  }, options);
  var server = dgram.createSocket('udp4');
  server.on('listening', function(){
    var address = server.address();
    console.info(util.format('udp server listening on %s:%d', address.address, address.port));
  });

  server.on('message', function(msg){
    msg = msg.toString();
    debug('message:%s', msg);
    stats.add(msg);
  });

  server.bind(options.port, options.host);
}

start()