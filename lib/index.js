'use strict';

var jobDispatcher = require('./job-dispatcher');
var _ = require('lodash');

var jobs = {
  wallet: {
    update: 'Update Wallet Data'
  },
  armory: {
    update: 'Update Armory Wallet Data'
  },
  singleAddresses: {
    update: 'Update Single Addresses Wallet Data',
    insert: 'Insert addresses into Single Addresses Wallet',
    remove: 'Remove addresses from Single Addresses Wallet'
  },
  chain: {
    fetchTransactionsFromAddresses: 'Fetch transactions from addresses'
  },
  transaction: {
    addOrUpdate: 'Add or update transaction info'
  }
};

var dispatches = _.mapValues(jobs, function (job, packageName) {
  return _.mapValues(job, function (description, functionName) {
    packageName = packageName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return jobDispatcher(packageName, functionName, description);
  });
});

module.exports = dispatches;
