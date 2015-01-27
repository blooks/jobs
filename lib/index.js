'use strict';

var jobDispatcher = require('./job-dispatcher');
var _ = require('lodash');

var jobs = {
  wallet: {
    update: 'Update Wallet Data',
    insertAddresses: 'Insert addresses into Single Addresses Wallet',
    removeAddresses: 'Remove addresses from Single Addresses Wallet'
  }
};

var dispatches = _.mapValues(jobs, function (job, worker) {
  return _.mapValues(job, function (description, functionName) {
    worker = worker.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return jobDispatcher(worker, functionName, description);
  });
});

module.exports = dispatches;