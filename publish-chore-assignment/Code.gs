var webhookUrl = "REPLACE-ME";
var slackChannel = "#REPLACE-ME";
var choreOneColumn = 2;
var choreTwoColumn = 3;


function postAllChores(){
  var dayOfWeek = getDayOfWeek_();
  var choreOneLead = getChoreOneLead_(true); 
  var choreTwoLead = getChoreTwoLead_(true); 
  
  var runnerUp = choreOneLead.name;
  if(choreTwoLead.name == choreOneLead.name)
    runnerUp = "someone else";
    
  var psMsg ="\n\n*P.S.*: *"+choreTwoLead.name+"* if you can't then find another ~victim~ volunteer, you can always voluntell *"+runnerUp+"*. :thank_you:";
  psMsg += "\n*P.S.S.*: If both of them are on PTO, [replace with rule].";
  
  
  postToSlack_(slackChannel, 
               "ChoreBot", 
               "*Happy "+dayOfWeek+"* :wave: Team! It's time to run the randomizer", 
               choreOneLead.message + "\n\n:and:\n\n" + choreTwoLead.message + "\n\n" + psMsg);
}

//Randomize standup order
function postChoreOneOnly(){
  var dayOfWeek = getDayOfWeek_();
  var assignmentMessage = getChoreOneLead_().message; 
  
  postToSlack_(slackChannel, 
               "ChoreBot - Description for Chore 1", 
               "*Happy "+dayOfWeek+"* :wave: Team! It's time to run the randomizer", 
               assignmentMessage);
}

//Randomize standup order
function postChoreTwoOnly(){
  var dayOfWeek = getDayOfWeek_();
  var assignmentMessage = getChoreTwoLead_().message; 
  
  postToSlack_(slackChannel, 
               "ChoreBot - Description for Chore 2", 
               "*Happy "+dayOfWeek+"* :wave: Team! It's time to run the randomizer", 
               assignmentMessage);
}

function getChoreOneLead_(omitPSMsg){
  var rand_person = getRandPerson_(choreOneColumn);
  var person_name = rand_person[0];
  var person_slack_id = rand_person[1];
  
  var message = "Chore 1 will be done by: *<@"+person_slack_id+">*\n:right: *[replace with some helpful quicklinks/shortcuts]*";
  if(!omitPSMsg)
    message += "\n\n*P.S.*: "+person_name+", if you can't then [replace with rule]. :thank_you:\n*P.S.S.*: If "+person_name+" is on PTO, [replace with rule].";
  
  return {message: message, name: person_name, slackId: person_slack_id};
}

function getChoreTwoLead_(omitPSMsg){
  var rand_person = getRandPerson_(choreTwoColumn);
  var person_name = rand_person[0];
  var person_slack_id = rand_person[1];
  
  var message = "Chore 2 will be done by: *<@"+person_slack_id+">*\n:right: *[replace with some helpful quicklinks/shortcuts]*";
  if(!omitPSMsg)
    message += "\n\n*P.S.*: "+person_name+", if you can't then [replace with rule]. :thank_you:\n*P.S.S.*: If "+person_name+" is on PTO, [replace with rule].";
  
  return {message: message, name: person_name, slackId: person_slack_id};
}

function getDayOfWeek_(){
  //Get the current date
  var today = new Date();
  
  //Don't run if it is the weekend. Bots need to rest too!
  if(!(today.getDay() % 6)) return;
  
  return today.toLocaleString('en-us', {weekday:'long'});
}

function getRandPerson_(col_idx) {
  // Get the list of team members
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s_people = ss.getSheetByName('list');
  var team = s_people.getDataRange().getValues();
  
  //Get all people that haven't been picked for a specific column
  var availPeople = team.reduce(function(ar, e) {
    if (e[col_idx] == "") ar.push([e[0], e[1]]) // [name, slack member id]
    return ar;
  }, []);
  
  //if no available People, reset counter and we can choose from entire list
  if(availPeople.length == 0) {
    availPeople = team.reduce(function(ar, e) {
      ar.push([e[0], e[1]]) // [name, slack member id]
      return ar;
    }, []);
    
    //reset all chore "picked" comments
    for (var i=1; i<team.length; i++)
      s_people.getRange(i+1,col_idx+1).setValue('');
  }
  
  var personAssigned = "";
  if(availPeople.length == 1)
    personAssigned = availPeople[0];
  else {
    var rand_idx = Math.floor(Math.random() * availPeople.length);
    personAssigned = availPeople[rand_idx]; 
  }
  
  //mark them as picked
  var personId = team.findIndexByName(personAssigned[0]);
  s_people.getRange(personId+1,col_idx+1).setValue('picked');

  return personAssigned;
}

Array.prototype.findIndexByName = function(search){
  if(search == "") return false;
  for (var i=0; i<this.length; i++)
    if (this[i][0] == search) return i;
  return -1;
} 


function postToSlack_(channel, bot_name, greeting, message, footer_pfx) {
  var footer = "<REPLACE-ME|edit sheet>; <REPLACE-ME|edit script>";
  if(footer_pfx)
   footer = footer_pfx + footer; 
  
  var payload = {
    "channel" : channel,
    "username" : bot_name,
    "text" : greeting,
    "attachments": [{
      "text": message,
      "footer": footer,
      "mrkdwn_in": ["text"]
    }]
  }
 
  var options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(payload)
  };
 
  return UrlFetchApp.fetch(webhookUrl, options)
}