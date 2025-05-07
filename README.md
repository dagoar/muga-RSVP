# RSVP Telegram bot

An event-organizer bot for our group, using AWS Lambda and Telegram API Webhooks

## Setup
### Telegram
1. Go to [Telegram Web](https://web.telegram.org/).
3. Start a chat with [@BotFather](https://telegram.me/BotFather).
4. Type "/start".
5. Type "/newbot" to create a new bot. I named my bot "mugarsvp_bot".
6. Note the HTTP API access token that @BotFather will reply you after you created the bot.

### Code
Checkout code from this repo, then
```
$ cp config.sample.js config.js
```
Open up ```config.js``` and fill in your Telegram HTTP API access token obtained in the first step then run this command:
```
$ zip -r telegram-bot.zip *.js node_modules/*
```

### AWS DynamoDB

We use a DynamoDB table to store data.
Each item has a unique ID, which we use as the partition key for the table.

#### To create a DynamoDB table
1. Open the DynamoDB console at https://console.aws.amazon.com/dynamodb/.
2. Choose Create table.
3. For Table name, enter ```telegram-bot-events```.
4. For Partition key, enter ```id```.
5. Choose Create table.

### AWS Lambda
1. Go to [AWS Lambda functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions).
2. Click "Create function".
3. Under the "Select blueprint" screen, search for "hello-world"and you will see the hello-world blueprint which says "A starter AWS Lambda function.".
4. Click on "hello-world" (NOT "hello-world-python").
5. You will be brought to the "Configure Function" page.
6. Under "Name", you can choose any name for your function. I called it "telegram-bot".
7. Under "Runtime", ensure it is "Node.js".
8. Under "Code entry type", choose "Upload a .ZIP file" and click the "Upload" button" to browse for the file "telegram-bot.zip" which you have zipped previously.
9. Under "Handler", we leave it as "index.handler".
10. Under "Role", we choose "Basic Execution Role".
11. You will be brought to a "Role Summary" page.
12. Under "IAM Role", choose "lambda_basic_execution".
13. Under "Role Name", choose "oneClick_lambda_basic_execution_.....".
14. Click "Allow".
15. You will be brought back to the "Configure Function" page.
16. Leave "Memory (MB)" as "128MB".
17. You might want to increase "Timeout" to "15" seconds.
18. Under VPC, choose "No VPC".
19. Click "Next".
20. Click "Create function".


### Set Telegram Webhook
1. Replace &lt;ACCESS_TOKEN&gt; with your Telegram HTTP API access token obtained in the first step. 
2. Replace &lt;INVOKE_URL&gt; with your Invoke URL obtained in the previous step.
3. Run this command:
```
$ curl --data "url=<INVOKE_URL>" "https://api.telegram.org/bot<ACCESS_TOKEN>/setWebhook"
```
You should get back a response similar to this:
```
$ {"ok":true,"result":true,"description":"Webhook was set"}
```

### Testing via Telegram
1. Message your Telegram Bot that you have created.
2. Type in "/help" (without the quotes).
3. You should get back a list of commands.