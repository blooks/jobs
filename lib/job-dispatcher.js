'use strict';

var _ = require('lodash');
var kue = require('coyno-kue');
var config = require('coyno-config');

var globalDefaults = {
  attempts: config.queue.dispatcher.defaults.attempts,
  backoff: {
    delay: config.queue.dispatcher.defaults.delay,
    type: config.queue.dispatcher.defaults.backoffType
  }
};

function optionsFromJob(job) {
  if (typeof job === 'undefined') {
    return undefined;
  }

  return {
    priority: job._priority,
    attempts: job.attempts && job.attempts.max,
    backoff: job._backoff
  };
}


function configFromOptions(job, options) {
  if (options.priority) {
    job.priority(options.priority);
  }

  if (options.attempts) {
    job.attempts(options.attempts);
  }

  if (options.backoff) {
    job.backoff(options.backoff);
  }

  if (options.complete) {
    job.on('complete', function (results) {
      options.complete(null, results);
    });
    job.on('failed', function () {
      options.complete('Job failed');
    });
  }

  return job;
}

function jobDispatcher(processor, functionName, title, defaults) {
  defaults = _.merge({}, globalDefaults, defaults);

  var fn = function (data, options, done) {
    if (typeof done === 'undefined' && typeof options === 'function') {
      done = options;
      options = undefined;
    }
    if (typeof done !== 'function') {
      done = undefined;
    }

    options = _.merge({}, defaults, options);
    data = _.merge({title: title}, data);

    var job = kue.jobs.create(processor + '.' + functionName, data);

    configFromOptions(job, options);

    job.save(done);
  };

  fn.from = function (parentJob, extraData, options, done) {
    if (typeof parentJob === 'undefined') {
      return fn(extraData, options, done);
    }

    if (typeof done === 'undefined' &&
      typeof options === 'undefined' &&
      typeof extraData === 'function') {
      done = extraData;
      extraData = undefined;
      options = undefined;
    }
    else if (typeof done === 'undefined' && typeof options === 'function') {
      done = options;
      options = undefined;
    }

    options = _.merge({}, defaults, optionsFromJob(parentJob), options);
    var data = _.merge({}, parentJob.data, {title: title, parentJob: parentJob.id});
    data = _.assign(data, extraData);

    fn(data, options, done);
  };

  fn.defaults = defaults;

  return fn;
}

module.exports = jobDispatcher;
