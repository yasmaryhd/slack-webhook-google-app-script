var webhookUrl = "REPLACE-ME";
var weekday = ["Sunday", "Monday", "Tech Trivia Tuesday", "Hump Day", "Thursday", "Friday", "Saturday"]; //change how you want day of week to appear
var test_slack_channel = "#REPLACE-ME";
var main_slack_channel = "#REPLACE-ME";
var admin_slack_channel = "#REPLACE-ME";

function postTestQuestion(){
  postTriviaQuestion_(true);
}

function postTestAnswer(){
  postTriviaAnswer_(true);
}

function postOfficialQuestion(){
  postTriviaQuestion_(false);
}

function postOfficialAnswer() {
  postTriviaAnswer_(false);
}


function postTriviaQuestion_(isTest) {
  // Get the list of trivia
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s_trivia = isTest ? ss.getSheetByName('ideas') : ss.getSheetByName('trivia');
  var trivia = s_trivia.getDataRange().getValues();
  
  //Get unused trivia
  var availTrivia = trivia.reduce(function(ar, e) {
    if ((!isTest && (!e[3] || e[3] == "")) || (isTest && e[3] == "x")) ar.push([e[0], e[1]])
    return ar;
  }, []);
  
  //notify admins if more trivia is needed
  if(!isTest && availTrivia.length < 5) { // 5 = a month left
    var remaining = availTrivia.length-1;
    if(remaining == 0)
      postToAdmins_(":sadpanda: We are out of trivia questions. Can you add some more?", isTest);
    else if(remaining < 0){
      postToAdmins_(":sob: Tried to post trivia question but there was nothing :sob:. Can you add some more?", isTest);
      return;
    } else
      postToAdmins_(":warning: We are have "+remaining+" trivia questions remaining. Can you add some more?", isTest);
  }
  
  var triviaSelected = "";
  if(availTrivia.length == 1)
    triviaSelected = availTrivia[0];
  else {
    var rand_idx = Math.floor(Math.random() * availTrivia.length);
    triviaSelected = availTrivia[rand_idx]; 
  }
  
  // mark trivia as picked
  if(!isTest) {
    var today = new Date();
    var triviaId = trivia.findIndexByName(triviaSelected[0]);
    s_trivia.getRange(triviaId+1,4).setValue(today); //date question posted
    s_trivia.getRange(triviaId+1,5).setValue("PENDING"); //date answer posted
  }

  //post to channel
  postQuestion_(isTest, triviaSelected[0], triviaSelected[1]);
}

function postTriviaAnswer_(isTest) {
  // Get the list of trivia
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s_trivia = isTest ? ss.getSheetByName('ideas') : ss.getSheetByName('trivia');
  var trivia = s_trivia.getDataRange().getValues();
  
  //Get trivia answers marked as pending
  var pendingTrivia = trivia.reduce(function(ar, e) {
    if ((!isTest && e[4] == "PENDING") || (isTest && e[4] == "x")) ar.push([e[0],e[1],e[2]])
    return ar;
  }, []);
  
  //if no trivia answer pending to post, then skip
  if(pendingTrivia.length == 0) {
    return;
  }
  
  var answers = "";
  var imageUrl = ""; //use the last valid imageUrl
  //Iterate through all pending trivia answers
  for (var i=0; i<pendingTrivia.length; i++) {
    var curr = pendingTrivia[i];
    if(answers != "")
      answers += "\n\n";
    answers += "*Trivia Question*: "+curr[0]+"\n\n*Answer*: "+curr[2];
    
    imageUrl = curr[1] ? curr[1] : "";
  
    //mark as posted
    if(!isTest){
      var today = new Date();
      var triviaId = trivia.findIndexByName(curr[0]);
      s_trivia.getRange(triviaId+1,5).setValue(today); //date answer posted
    }
  }

  //post answer to channel
  postAnswers_(isTest, answers, imageUrl);
}

Array.prototype.findIndexByName = function(search){
  if(search == "") return false;
  for (var i=0; i<this.length; i++)
    if (this[i][0] == search) return i;
  return -1;
} 

function postQuestion_(isTest, triviaQuestion, imageUrl){
  var today = new Date();
  var currentDayName = weekday[today.getDay()];
  
  postToSlack_(isTest ? test_slack_channel : main_slack_channel,
               "*Happy "+currentDayName+"* :wave:! Who is ready for trivia? :party_wizard:", 
               "*Trivia Question*: "+ triviaQuestion+"\n\n_Have a guess? Post your guesses in thread. Answer will be revealed [replace with date]!_",
              "[Add some supporting text here if needed].",
              imageUrl);
}

function postAnswers_(isTest, answers, imageUrl){
  var today = new Date();
  var currentDayName = weekday[today.getDay()];
  
  postToSlack_(isTest ? test_slack_channel : main_slack_channel,
               "*Happy "+currentDayName+"*! Ready for your Trivia answer?", 
               answers,
               "[Add some supporting text here if needed].",
               imageUrl);
}

function postToAdmins_(message, isTest){
  postToSlack_(isTest ? test_slack_channel : admin_slack_channel, 
               "*Trivia Bot* needs help!",
               message,
               "<REPLACE-ME|edit sheet>");
}

function postToSlack_(slackChannel, greeting, message, footer, imageUrl) {
  var payload = {
    "channel" : slackChannel,
    "username" : "TriviaBot",
    "text" : greeting,
    "attachments": [{
      "text": message,
      "footer": footer,
      "mrkdwn_in": ["text"],
      "image_url": imageUrl
    }]
  }
  
  var options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(payload)
  };
  
  return UrlFetchApp.fetch(webhookUrl, options);
}