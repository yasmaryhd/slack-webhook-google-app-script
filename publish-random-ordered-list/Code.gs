var webhookUrl = "REPLACE-ME";

//Randomize list order
function postRandomListOrder(){
  //Get the current date
  var today = new Date();
  
  //Don't run if it is the weekend. Bots need to rest too!
  if(!(today.getDay() % 6)) return;
  
  var dayOfWeek = today.toLocaleString('en-us', {weekday:'long'});

  var message = "";
  var randOrder = randListOrder_();
  for (var i = 0; i < randOrder.length; i++)
    message += (i+1)+". "+randOrder[i]+"\n";
 
  postToSlack_("#REPLACE-ME", 
               "Randomizer Bot", 
               "*Happy "+dayOfWeek+"* :wave:! It's time to randomize standup order", 
               message + "\n*P.S.*: If someone is on PTO or not able to attend, skip them!");
}


//Return a list of randomly ordered people
function randListOrder_() {
  // Get the list of people
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s_people = ss.getSheetByName('people');
  var avail_people = s_people.getDataRange().getValues();
  
  // Set up an array to store people we have already randomized
  var num_people = avail_people.length;
  var rand_people = [];
  
  function getRandIdx() {
    //No people available to randomize
    if(avail_people.length == 0)
      return -1;
    
    return Math.floor(Math.random() * avail_people.length);
  }
  
  //Create our random lineup
  for (var i = 0; i < num_people; i++) {
    var rand_idx = getRandIdx();
    var person = avail_people[rand_idx][0];
    rand_people.push(person);
    avail_people.splice(rand_idx,1);
  }
    
  return rand_people;
  
}

function postToSlack_(channel, bot_name, greeting, message, footer) {
  var payload = {
    "channel" : channel,
    "username" : bot_name,
    "text" : greeting,
    "attachments": [{
      "text": message,
      "footer": "<REPLACE-ME|edit sheet>; <REPLACE-ME|edit script>",
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