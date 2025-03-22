const { StatsD } = require('node-statsd');

const statsd = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'webapp.',
});

module.exports = statsd;