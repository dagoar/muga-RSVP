const telegramBotUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

async function sendMessageToTelegram(chatId, message) {
    return await fetch(`${telegramBotUrl}/sendMessage`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });
}

export const handler = async(event, context) => {
    // Message
    let update = JSON.parse(event.body);

    console.log("update", update);

    console.log("mensaje", update.message.text);
  
    console.log("chat_id", update.message.chat.id);


    await sendMessageToTelegram(update.message.chat.id, `you said "${update.message.text}"`);
    return context.succeed();

};