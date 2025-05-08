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
$ npm install
```
```
$ npm run zip
```

### AWS DynamoDB

We use a DynamoDB table to store data.
Each item has a unique ID, which we use as the partition key for the table.

#### To create a DynamoDB table
1. Open the [DynamoDB console](https://console.aws.amazon.com/dynamodb/).
2. Choose Create table.
3. For Table name, enter ```telegram-bot-events```.
4. For Partition key, enter ```id```.
5. Choose Create table.

### AWS Lambda
1. Go to [AWS Lambda functions](https://console.aws.amazon.com/lambda/).
2. Click "Create function".
3. Select "Author from scratch".
4. Under "Function name", you can choose any name for your function. I called it "telegram-bot".
5. Under "Runtime", ensure it is "Node.js 22.x".
6. Inside "Adittional Configurations" check "Enable function URL"
7. Under "Auth Type" select "NONE"
8. Leave the rest as default and Click "Create function".
9. You will be brought to the "Function" page.
10. Go to the Configuration tab 
11. Add the following environment variables
     * Key: BOT_TOKEN    
     Value: Telegram HTTP API access token obtained in the first step.
     * Key: BOT_TABLE   
     Value: name of the table created in the previous step.
12. You might also want to increase "Timeout" to "15" seconds.
13. Go back to the Code tab and click "Upload From", then submit the .zip generated in the "Code" step.

### Set Telegram Webhook
1. Replace <ACCESS_TOKEN> with your Telegram HTTP API access token obtained in the first step. 
2. Replace <FUNCTION_URL> with your Function URL obtained in the previous step.
3. Run this command:
```
$ curl --data "url=<FUNCTION_URL>" "https://api.telegram.org/bot<ACCESS_TOKEN>/setWebhook"
```
You should get back a response similar to this:
```
$ {"ok":true,"result":true,"description":"Webhook was set"}
```

### Testing via Telegram
1. Message your Telegram Bot that you have created.
2. Type in "/help" (without the quotes).
3. You should get back a list of commands.