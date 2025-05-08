const telegramBotUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

const DEBUG_CHAT = 61677024; // Id of my own chat with the bot

export class ProcessUpdate {
    chat_id;
    text;
    upd;

    constructor(upd) {
        if (upd.message && upd.message.chat && upd.message.chat.id) {
            this.chat_id = upd.message.chat.id;
        } else if (upd.channel_post && upd.channel_post.chat && upd.channel_post.chat.id) {
            this.chat_id = upd.channel_post.chat.id;
        } else if (upd.my_chat_member) {
            this.chat_id = upd.my_chat_member.chat.id;
        } else if (upd.edited_message) {
            this.chat_id = upd.edited_message.chat.id;
        }

        if (!this.chat_id) {
            this.sendMessageToDebug(JSON.stringify(upd));
        }

        this.upd = upd;

        if (upd.channel_post && upd.channel_post.text) {
            this.text = `answer to '${upd.channel_post.text}'`;
        } else if (upd.my_chat_member) {
            this.text = `Bienvenid@ ${upd.my_chat_member.from.username}`;
        } else if (upd.message && upd.message.new_chat_member) {
            this.text = `Bienvenid@ ${upd.message.new_chat_member.username}`;
        } else if (upd.message && upd.message.left_chat_member) {
            this.text = `Adiós ${upd.message.left_chat_member.username}`;
        }
        
    }

    async doProcess(context) {
        if (this.upd.message) {
            if (this.upd.message.text) {
                if (this.upd.message.text.startsWith('/start')) {
                    this.text = 'Hola, soy le planner de Muganawa';
                } else if (this.upd.message.text.startsWith('/help')) {
                    this.text = 'Escribe algo y yo te responderé';
                } else if (this.upd.message.text.startsWith('/evento')) {
                    this.text = 'Proximamente...';
                } else if (this.upd.message.text.startsWith('/burlarse')) {
                    if (this.upd.message.reply_to_message && this.upd.message.reply_to_message.text) {
                        this.text = burlarse(this.upd.message.reply_to_message.text);
                        await this.deleteMessage(this.upd.message.message_id);
                    }
                }
            } else {
                await this.sendMessageToDebug(JSON.stringify(this.upd));
            }
        }

        if (this.text) {
            await this.sendMessageToTelegram();
        }
        return context.succeed();
    }

    async sendMessageToTelegram() {
        return await fetch(`${telegramBotUrl}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chat_id,
                    text: this.text,
                }),
            });
    }

    async sendMessageToDebug(msg) {
        return await fetch(`${telegramBotUrl}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: DEBUG_CHAT,
                    text: msg,
                }),
            });

    }

    async deleteMessage(msg_id) {
        return await fetch(`${telegramBotUrl}/deleteMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chat_id,
                    message_id: msg_id,
                }),
            });
    }

}

function burlarse(string) {
    string = string.replace(/[aeiou]/g, "i");
    string = string.replace(/[AEIOU]/g, "I");
    string = string.replace(/[áéíóú]/g, "i");
    return string;
}
