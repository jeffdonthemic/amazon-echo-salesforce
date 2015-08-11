// simple test script

var nforce = require('./nforce');
var _ = require('./lodash');
var moment = require('./moment-timezone');
var pluralize = require('./pluralize');

var org = nforce.createConnection({
  clientId: 'YOUR-CLIENTID',
  clientSecret: 'YOUR-CLIENT-SECRET',
  redirectUri: 'http://localhost:3000/oauth/_callback',
  mode: 'single'
});

var username = 'YOUR-USERNAME';
var password = 'YOUR-PASSWORD&SECURITY-TOKEN';

var opportunityName = 'Jones';

var query = "select name, stagename, probability, amount from Opportunity where Name = '" + opportunityName + "'";
// auth and run query
org.authenticate({ username: username, password: password }).then(function(){
  return org.query({ query: query })
}).then(function(results) {
  var speechOutput = 'Sorry, I could not find Opportunity ' + opportunityName;
  if (results.records.length > 0) {
    var opp = results.records[0];
    speechOutput = 'I found Opportunity ' + opportunityName + ' for $' + opp.get('Amount') + ', the stage is ' + opp.get('StageName') + ' and the probability is ' + opp.get('Probability') + '%';
  }
  console.log(speechOutput);
}).error(function(err) {
  console.log(err);
});
