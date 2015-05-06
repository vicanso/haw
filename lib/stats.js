'use strict';
var _ = require('lodash');
var logDict = {};
var db = require('./db');
var co = require('co');
exports.add = add;

/**
 * [add 添加统计]
 * @param {[type]} msg [description]
 */
function add(msg){
  var arr = msg.split('|');
  if(arr.length !== 5){
    console.warn('illegal msg:%s', msg);
    return;
  }
  var createdAt = parseInt(arr[4] / 1000);
  var category = arr[0];
  if(!category){
    return;
  }
  var data = {
    category : category,
    key : arr[1],
    type : arr[2],
    value : GLOBAL.parseFloat(arr[3]),
    createdAt : createdAt
  };
  var key = data.category + data.key;
  if(!logDict[key]){
    logDict[key] = [];
  }
  logDict[key].push(data);
  db.addStatsCategory(category);
}


setTimeout(function(){
  add('trees-MacBook-Air.local|mem.usageRate|gauge|40|1430230630430');
  setTimeout(function(){
    add('trees-MacBook-Air.local|mem.usageRate|gauge|40|1430230630430');
  }, 3000);
}, 3000);