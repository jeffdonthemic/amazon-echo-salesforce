/**
 * App ID for the skill to restrict access
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var CLIENT_ID = 'YOUR-CLIENT-ID';
var CLIENT_SECRET = 'YOUR-CLIENT-SECRET';
var USERNAME = 'YOUR-SALESFORCE-USERNAME';
var PASSWORD = 'YOUR-SALESFORCE-PASSWORD';
var CALLBACK_URL = 'http://localhost:3000/oauth/_callback';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var nforce = require('nforce');
var _ = require('lodash');
var moment = require('moment-timezone');
var pluralize = require('pluralize');

/**
 * Salesforce is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Salesforce = function () {
    AlexaSkill.call(this, APP_ID);
};

var org = nforce.createConnection({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: CALLBACK_URL,
  mode: 'single'
});

// Extend AlexaSkill
Salesforce.prototype = Object.create(AlexaSkill.prototype);
Salesforce.prototype.constructor = Salesforce;

Salesforce.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Salesforce onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Salesforce.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Salesforce onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Salesforce.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Salesforce onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Salesforce.prototype.intentHandlers = {

  // check the status of an apportunity by name
  OpportunityStatusEvent: function (intent, session, response) {
      handleOpportunityStatusRequest(intent, response);
  },

  // start the new lead creation process
  LeadStartIntent: function (intent, session, response) {
      handleLeadStartRequest(session, response);
  },

  // add the name to the lead session
  LeadNameIntent: function (intent, session, response) {
      handleLeadNameIntent(intent, session, response);
  },

  // get the name and create the lead
  LeadCompanyIntent: function (intent, session, response) {
      handleLeadCompanyIntent(intent, session, response);
  },

  // check for any new leads
  NewLeadsIntent: function (intent, session, response) {
      handleNewLeadsRequest(response);
  },

  // check my calendar
  MyCalendarIntent: function (intent, session, response) {
      handleMyCalendarRequest(response);
  },

  // help with 'Salesforce'
  HelpIntent: function (intent, session, response) {
      response.ask("You can ask Salesforce to check for any new leads, your calendar for today, the status of a specific opportunity or to create a new lead, or, you can say exit... What can I help you with?");
  }
};

// start a new session to create a lead
function handleLeadStartRequest(session, response) {
  var speechOutput = "OK, let's create a new lead., What is the person's first and last name?";
  response.ask(speechOutput);
}

// continue the session, collect the person's name
function handleLeadNameIntent(intent, session, response) {
  var speechOutput = "Got it. the name is, " + intent.slots.Name.value + "., What is the company name?";
  session.attributes.name = intent.slots.Name.value;
  response.ask(speechOutput);
}

// collect the company name and create the actual lead
function handleLeadCompanyIntent(intent, session, response) {
  var speechOutput = "Bingo! I created a new lead for  "
    + session.attributes.name + " with the company name " + intent.slots.Company.value;
  var names = session.attributes.name.split(' ');
  var obj = nforce.createSObject('Lead');
  obj.set('FirstName', names[0]);
  obj.set('LastName', names[1]);
  obj.set('Company', intent.slots.Company.value);

  org.authenticate({ username: USERNAME, password: PASSWORD }).then(function(){
    return org.insert({ sobject: obj })
  }).then(function(results) {
    if (results.success) {
      response.tellWithCard(speechOutput, "Salesforce", speechOutput);
    } else {
      speechOutput = 'Darn, there was a salesforce problem, sorry.';
      response.tellWithCard(speechOutput, "Salesforce", speechOutput);
    }
  }).error(function(err) {
    var errorOutput = 'Darn, there was a Salesforce problem, sorry';
    response.tell(errorOutput, "Salesforce", errorOutput);
  });
}

// fetch an opportunity by name
function handleOpportunityStatusRequest(intent, response) {
  var opportunityName = intent.slots.OpportunityName.value;
  var query = "Select Name, StageName, Probability, Amount from Opportunity where Name = '" + opportunityName + "'";
  // auth and run query
  org.authenticate({ username: USERNAME, password: PASSWORD }).then(function(){
    return org.query({ query: query })
  }).then(function(results) {
    var speechOutput = 'Sorry, I could not find an Opportunity named, ' + opportunityName;
    if (results.records.length > 0) {
      var opp = results.records[0];
      speechOutput = 'I found Opportunity ' + opportunityName + ' for $' + opp.get('Amount')
        + ', the stage is ' + opp.get('StageName') + ' and the probability is '
        + opp.get('Probability') + '%';
    }
    response.tellWithCard(speechOutput, "Salesforce", speechOutput);
  }).error(function(err) {
    var errorOutput = 'Darn, there was a Salesforce problem, sorry';
    response.tell(errorOutput, "Salesforce", errorOutput);
  });
}

// find any calendar events for today
function handleMyCalendarRequest(response) {
  var query = 'select id, StartDateTime, Subject, Who.Name from Event where startdatetime = TODAY order by StartDateTime';
  // auth and run query
  org.authenticate({ username: USERNAME, password: PASSWORD }).then(function(){
    return org.query({ query: query })
  }).then(function(results) {
    var speechOutput = 'You have  ' + results.records.length + ' ' + pluralize('event', results.records.length) + ' for today, ';
    _.forEach(results.records, function(rec) {
      speechOutput += 'At ' + moment(rec.get('StartDateTime')).tz('America/Los_Angeles').format('h:m a') + ', ' + rec.get('Subject');
      if (rec.get('Who')) speechOutput += ', with  ' + rec.get('Who').Name;
      speechOutput += ', ';
    });
    response.tellWithCard(speechOutput, "Salesforce", speechOutput);
  }).error(function(err) {
    var errorOutput = 'Darn, there was a Salesforce problem, sorry';
    response.tell(errorOutput, "Salesforce", errorOutput);
  });
}

// find any leads created today
function handleNewLeadsRequest(response) {
  var query = 'Select Name, Company from Lead where CreatedDate = TODAY';
  // auth and run query
  org.authenticate({ username: USERNAME, password: PASSWORD }).then(function(){
    return org.query({ query: query })
  }).then(function(results) {
    speechOutput = 'Sorry, you do not have any new leads for today.'
    var recs = results.records;
    if (recs.length > 0) {
      speechOutput = 'You have ' + recs.length + ' new ' + pluralize('lead', recs.length) + ', ';
      for (i=0; i < recs.length; i++){
        speechOutput +=  i+1 + ', ' + recs[i].get('Name') + ' from ' + recs[i].get('Company') + ', ';
        if (i === recs.length-2) speechOutput += ' and ';
      }
      speechOutput += ', Go get them tiger!';
    }
    // Create speech output
    response.tellWithCard(speechOutput, "Salesforce", speechOutput);
  }).error(function(err) {
    var errorOutput = 'Darn, there was a Salesforce problem, sorry';
    response.tell(errorOutput, "Salesforce", errorOutput);
  });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Salesforce skill.
    var salesforce = new Salesforce();
    salesforce.execute(event, context);
};
