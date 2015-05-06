'use strict';
var mongoose = require('mongoose');
var co =require('co');
var _ = require('lodash');
var debug = require('debug')('jt.haw');
var Schema = mongoose.Schema;
var mongooseConnection = null;
var modelDict = {};

exports.initConnection = initConnection;
exports.addStatsCategory = addStatsCategory;

/**
 * [initConnection 初始化连接]
 * @param  {[type]} uri     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function initConnection(uri, options){
  if(mongooseConnection){
    return mongooseConnection;
  }
  options = _.extend({
    db : {
      native_parser : true
    },
    server : {
      poolSize : 5
    }
  }, options);
  mongooseConnection = mongoose.createConnection(uri, options);
  mongooseConnection.on('connected', function(){
    console.log('mongodb connected');
  });
  mongooseConnection.on('disconnected', function(){
    console.log('mongodb disconnected');
  });
  mongooseConnection.on('error', function(err){
    console.error(err);
  });
}

/**
 * [update 更新操作]
 * @param  {[type]} collection [description]
 * @param  {[type]} conditions      [description]
 * @param  {[type]} update     [description]
 * @return {[type]}            [description]
 */
function *update(collection, conditions, update){
  var Model = getModel(collection);
  var options = {
    upsert : true,
    multi : false
  };
  debug('update conditions:%j, data:%j', conditions, update);
  var doc = yield function(done){
    Model.update(conditions, update, options, done);
  };
  return doc;
}

/**
 * [getModel 获取model]
 * @param  {[type]} collection [description]
 * @return {[type]}            [description]
 */
function getModel(collection){
  if(!mongooseConnection){
    throw new Error('the db is not init!');
  }
  if(modelDict[collection]){
    return modelDict[collection];
  }
  var schema = new Schema({}, {
    safe : false,
    strict : false,
    collection : collection
  });
  schema.index([
    {
      key : 1
    },
    {
      date : -1
    },
    {
      key : 1,
      date : -1
    }
  ]);
  var model = mongooseConnection.model(collection, schema);
  modelDict[collection] = model;
  return model;
}

var currentCategoryDict = {};
/**
 * [addStatsCategory 添加category]
 * @param {[type]} category [description]
 */
function addStatsCategory(category){
  if(currentCategoryDict[category]){
    return;
  }
  currentCategoryDict[category] = true;
  var Model = getStatsCategoryModel();
  co(function *(){
    var doc = yield function(done){
      Model.findOne({name : category}, done);
    };
    if(!doc){
      doc = yield function(done){
        new Model({
          name : category
        }).save(done);
      }
    }
    return doc;
  }).catch(function(err){
    delete currentCategoryDict[category];
    console.error(err);
  });
  
}

/**
 * [getStatsCategoryModel 获取记录stats category的collection]
 * @return {[type]} [description]
 */
function getStatsCategoryModel(){
  var collection = 'stats-category';
  var Model = modelDict[collection];
  if(!Model){
    var schema = new Schema({
      name : {
        type : String,
        required : true,
        unique : true
      }
    }, {
      collection : 'stats-category'
    });
    schema.index([
      {
        name : 1
      }
    ]);
    Model = mongooseConnection.model(collection, schema);
    modelDict[collection] = Model;
  }
  return Model;
}

initConnection('mongodb://vicanso:MY_MONGODB_JENNY_TREE@localhost:5000/stats')
