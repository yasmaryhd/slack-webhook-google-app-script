# slack-webhook-google-app-script
The following are example scripts that show how you can automate simple tasks using Slack Webhooks, Google Sheets, and Google App Scripts. They are not extensive and I don't promise they are bug free. These were just fun side projects to help me automate all the repetitive things I was doing on a day to day basis!

All the examples follow the same setup: Google sheet with customizable data, script attached to google sheet, and slack channel(s). 
_I've found that the data being in a Google sheet simplifies contributions from peers and friends as the script portion might be too intimidating for those who aren't as JavaScript savvy._

## Example Catalog

Will post more example scripts as I go :)

* [Publish random ordered list](publish-random-ordered-list/): We use this to determine the order for which we will give updates at our daily standup meeting but it can be used for anything. Basically just randomizes the list provided in the google sheet and displays the order in Slack.
* [Publish chore assignment](publish-chore-assignment/): We use this to assign someone from the team to particular chore(s) randomly each week. A chore for us is a task or set of tasks that need to get done on a weekly basis and we want to make sure someone is assigned to it so the work gets done. Since we are using a Google sheet, it keeps track of who has already been assigned to ensure everyone gets a chance. Chore assignments are then sent to Slack.
* [Post weekly message](post-weekly-message/): At the end of each week, we capture the awesome things we have accomplished to then share them out with the organization. This script will post a message in a set of channels and @ mention someone in particular that needs to be alerted.
* [Weekly Trivia](weekly-trivia/): Thought it would be fun to have a Trivia Bot for our community. This is a super simple setup where in Google Sheets you have a list of trivia questions & and their answers. The script then randomly picks one to post to a channel. The question and answer are posted separately, giving you flexibility on how you engage the community. It also supports testing out trivia questions to a private channel to collaborate with others.

# Getting Started

For each of the examples above,

* Import the xlsx file into google sheets
* Within sheets, go to Tools -> Script Editor
* Copy over the Code.gs contents into Script Editor
* Review script for instance of "REPLACE-ME" (e.g. slack channels, webhook url)
* Use script editor to run and troubleshoot script
* When you have it ready, you can setup a trigger to run the script at your desired cadence

# References

* [Webhooks](https://api.slack.com/messaging/webhooks#posting_with_webhooks) are a super convenient way to post messages into Slack 
* [Google App Script](https://developers.google.com/apps-script) is a way to add-on/extend functionality to Google suite offerings. For these examples, I focus on Google Sheets.