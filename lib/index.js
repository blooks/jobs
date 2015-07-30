'use strict';

var kue = require('kue');
var _ = require('lodash');
var log = require('coyno-log').child({component: 'CoynoJobs'});

var jobs = [
  'wallet.update',
  'addresses.fetchTransactions',
  'addresses.connectTransactions',
  'addresses.update',
  'exchange.update'
];

var CoynoJobs = function(redisUrl) {
  this.queue = kue.createQueue({
    redis: redisUrl
  });
};

CoynoJobs.prototype.addJob = function(type, payload, callback, onComplete) {
  if (_.indexOf(jobs, type) < 0) {
    throw new Error('Unkown Job Type', type);
  }
  var job = this.queue.create(type, payload).ttl(86400000);
  if (onComplete) {
    job.on('complete', function(result) {
      onComplete(null, result);
    });
    job.on('failed', function(errorMessage) {
      onComplete(errorMessage);
    });
  }
  if (!callback) {
    callback = function (err) {
      if (err) {
        log.error({type: type, payload: payload, error: err}, 'Failed to save job');
      }
    }
  }
  job.save(callback);
};

CoynoJobs.prototype.onJob = function(type, callback) {
  if (_.indexOf(jobs, type) < 0) {
    throw new Error('Unkown Job Type', type);
  }
  this.queue.process(type, callback);
};

module.exports = CoynoJobs;
