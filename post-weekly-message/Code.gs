var webhookUrl = "REPLACE-ME";


//Post Weekly message based on channels and day of week
function weeklyMessageRoundup(){
  //Get the current date
  var today = new Date();
  
  //Don't run if it is the weekend. Bots need to rest too!
  if(!(today.getDay() % 6)) return;
  
  var dayOfWeek = today.toLocaleString('en-us', {weekday:'long'});

  // Pull data from sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s_channels = ss.getSheetByName('channels');
  var channels = s_channels.getDataRange().getValues();
  
  // Get list of slack channels to roundup for today 
  var todaysRoundup = channels.reduce(function(ar, e) {
    if (e[1] == dayOfWeek) ar.push([e[0], e[2]]) //save channel and member id for @mention
    return ar;
  }, []);
  
  // Post to appropriate slack channels
  for (var i = 0; i < todaysRoundup.length; i++)
    postToSlack_(dayOfWeek, todaysRoundup[i][0], todaysRoundup[i][1]);
}

function postToSlack_(dayOfWeek, channel, fyiMember) {
  var fyiMemberMsg = "";
  if(fyiMember)
    fyiMemberMsg += ":fyi: <@"+fyiMember+">\n\n";
  
  var payload = {
    "channel" : channel,
    "username" : "MessageBot",
    "text" : "*Happy "+dayOfWeek+"* <!channel> :wave:! It's time for our *Weekly [What is this for?]* roundup :awesome:\n\n"+fyiMemberMsg+"_Post in thread:_",
    "attachments": [{
      "text": "Add helpful text here with more context",
      "footer": "<REPLACE-ME|edit sheet>; <REPLACE-ME|edit script>",
      "mrkdwn_in": ["text"]
    }]
  };
 
  var options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(payload)
  };
 
  return UrlFetchApp.fetch(webhookUrl, options);
}