'use strict'

var kue = require('kue')
var _ = require('lodash')
var log = require('@blooks/log').child({component: 'BlooksJobs'})

var jobs = [
  'wallet.update',
  'addresses.fetchTransactions',
  'addresses.connectTransactions',
  'addresses.update',
  'exchange.update'
]

var BlooksJobs = function (redisUrl) {
  this.queue = kue.createQueue({
    redis: redisUrl
  })
}

BlooksJobs.prototype.addJob = function (type, payload, callback, onComplete) {
  if (_.indexOf(jobs, type) < 0) {
    throw new Error('Unkown Job Type', type)
  }
  var job = this.queue.create(type, payload).ttl(86400000)
  if (onComplete) {
    job.on('complete', function (result) {
      onComplete(null, result)
    })
    job.on('failed', function (errorMessage) {
      onComplete(errorMessage)
    })
  }
  job.save(callback)
}

BlooksJobs.prototype.onJob = function (type, callback) {
  if (_.indexOf(jobs, type) < 0) {
    throw new Error('Unkown Job Type', type)
  }
  this.queue.process(type, callback)
}

module.exports = BlooksJobs
