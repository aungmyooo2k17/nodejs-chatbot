const request = require("request");
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const sendTextMessage = (senderId, text) => {
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.FACEBOOK_ACCESS_TOKEN },
      method: "POST",
      json: {
        recipient: { id: senderId },
        message: { text: text },
      },
    },
    function (err, res, body) {}
  );
};

module.exports = (event) => {
  const senderId = event.sender.id;
  const message = event.message.text;
  prepareMessageToReply(message, senderId);
};

async function prepareMessageToReply(message, senderId) {
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(
    process.env.PROJECT_ID,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: message,
        // The language used by the client (en-US)
        languageCode: "en-US",
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);

  const result = responses[0].queryResult;

  if (result.intent) {
    sendTextMessage(senderId, result.fulfillmentText);
  } else {
    sendTextMessage(senderId, "Sorry I don't understand.");
  }
}
