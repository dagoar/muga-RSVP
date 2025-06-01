import { DB } from './database.mjs';

const telegramBotUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

const DEBUG_CHAT_ID = process.env.DEBUG_CHAT_ID; // Id of my own chat with the bot

const signos = ['aries', 'tauro', 'géminis', 'geminis', 'cáncer', 'cancer', 'leo', 'virgo', 'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis', 'ofiuco'];

export class ProcessUpdate {
    chat_id;
    text;
    upd;
    config;

    constructor(upd) {
        if (upd.message && upd.message.chat && upd.message.chat.id) {
            this.chat_id = upd.message.chat.id;
        } else if (upd.channel_post && upd.channel_post.chat && upd.channel_post.chat.id) {
            this.chat_id = upd.channel_post.chat.id;
        } else if (upd.my_chat_member) {
            this.chat_id = upd.my_chat_member.chat.id;
        } else if (upd.edited_message) {
            this.chat_id = upd.edited_message.chat.id;
        } else if (upd.callback_query) {
            this.chat_id = upd.callback_query.message.chat.id;
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
        // get config
        await DB.get('config').then((value) => { this.config = value.Item });

        if (this.upd.callback_query) {
            let evento;
            await DB.get(this.upd.callback_query.message.message_id).then((value) => { evento = value.Item; });
            if (!evento) {
                this.text = `No hay evento para ${this.upd.callback_query.message.message_id}`;
            } else {
                if (this.upd.callback_query.data == 'voy') {
                    if (evento.asisten.includes(this.upd.callback_query.from.username)) {
                        this.text = `${this.upd.callback_query.from.username} ya está en la lista`;
                    } else {
                        evento.asisten.push(this.upd.callback_query.from.username);
                        await DB.put(evento);
                    }
                } else if (this.upd.callback_query.data == 'masuno') {
                    if (evento.asisten.includes(this.upd.callback_query.from.username)) {
                        evento.asisten.push(`Acompañante de ${this.upd.callback_query.from.username}`);
                    } else {
                        evento.asisten.push(this.upd.callback_query.from.username);
                        evento.asisten.push(`Acompañante de ${this.upd.callback_query.from.username}`);
                    }
                    await DB.put(evento);
                } else if (this.upd.callback_query.data == 'novoy') {
                    if (evento.asisten.includes(this.upd.callback_query.from.username)) {
                        // remove from list
                        evento.asisten.splice(evento.asisten.indexOf(this.upd.callback_query.from.username), 1);
                        await DB.put(evento);
                    }
                }
                await this.answerCallbackQuery(this.upd.callback_query.id);
                // edit message
                await editMessage(evento);
                this.text = null;
            }
        } else if (this.upd.edited_message) {
            console.log('edited_message', this.upd);
            //this.text = `editado ${this.upd.edited_message.text}`;
        } else if (this.upd.message) {
            if (this.upd.message.text) {
                if (this.upd.message.text.startsWith('/initdb')) {
                    let config = {
                        id: 'config',
                        tag: 'UnNegroFeo',
                    }
                    await DB.put(config);
                    this.text = 'La base de datos del bot ha sido inicializada.';
                } else if (this.upd.message.text.startsWith('/help')) {
                    this.text = `preguntale a @${this.config.tag}`;
                    this.config.tag = this.upd.message.from.username;
                    await DB.put(this.config);
                } else if (this.upd.message.text.startsWith('/evento')) {
                    this.sendMessageToDebug(this.upd.message.reply_to_message);
                    if (this.upd.message.reply_to_message && this.upd.message.reply_to_message.text) {
                        await this.deleteMessage(this.upd.message.message_id);
                        await this.createEvent(this.upd.message.reply_to_message);
                    }
                } else if (this.upd.message.text.startsWith('/burlarse')) {
                    if (this.upd.message.reply_to_message && this.upd.message.reply_to_message.text) {
                        this.text = `<i>${burlarse(this.upd.message.reply_to_message.text)}</i>`;
                        await this.deleteMessage(this.upd.message.message_id);
                        await this.replyMessage(this.upd.message.reply_to_message.message_id);
                        this.text = null;
                    }
                } else {
                    const words = this.upd.message.text.toLowerCase().split(/\s+/);
                    for (const word of words) {
                        if (signos.includes(word)) {
                            this.text = 'está pasando!';
                            break;
                        }
                    }
                }

            }
        } else {
            console.log('debug', this.upd);
            if (DEBUG_CHAT_ID) {
                await this.sendMessageToDebug(JSON.stringify(this.upd));
            }
        }

        if (this.text) {
            await this.sendMessage();
        }
        return context.succeed();
    }

    async createEvent(event_message) {
        console.log('createEvent', event_message);
        const event = {
            "chat_id": this.chat_id,
            "text": event_message.text,
            "entities": event_message.entities ? event_message.entities : null,
            "photo": event_message.photo ? event_message.photo : null,
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {
                            "text": "✅ Voy!",
                            "callback_data": "voy"
                        },
                        {
                            "text": "➕ Voy +1!",
                            "callback_data": "masuno"
                        }],
                    [
                        {
                            "text": "🚫 Excusa genérica",
                            "callback_data": "novoy"
                        }
                    ]
                ]
            }
        };

        const response = await sendMessageToTelegram(event);
        const data = await response.json();
        console.log('response', data);
        if (data.ok && data.result) {
            await DB.put({
                id: data.result.message_id,
                chat_id: this.chat_id,
                text: event.text,
                entities: event.entities,
                photo: event.photo,
                reply_markup: event.reply_markup,
                asisten: [],
            });
            return await this.pinMessage(data.result.message_id);
        }
        return;
    }

    async editMessage(evento) {
        let texto_editado = evento.text + '\n' + evento.asisten.length + '\n' + evento.asisten.join(', ');
        const event = {
            "chat_id": this.chat_id,
            "message_id": evento.id,
            "text": texto_editado,
            "entities": evento.entities ? evento.entities : null,
            "photo": evento.photo ? evento.photo : null,
            "reply_markup": evento.reply_markup,
        };

        return await fetch(`${telegramBotUrl}/editMessageText`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
    }

    async sendMessage() {
        const mensaje = {
            chat_id: this.chat_id,
            text: this.text,
        }

        return await sendMessageToTelegram(mensaje);
    }

    async replyMessage(msg_id) {
        const mensaje = {
            chat_id: this.chat_id,
            text: this.text,
            parse_mode: 'HTML',
            reply_parameters: { message_id: msg_id }
        }

        return await sendMessageToTelegram(mensaje);
    }

    async pinMessage(msg_id) {
        return await fetch(`${telegramBotUrl}/pinChatMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chat_id,
                    message_id: msg_id,
                    disable_notification: true,
                }),
            });
    }

    async sendMessageToDebug(msg) {
        if (!msg) {
            msg = JSON.stringify(this.upd);
        }
        const mensaje = {
            chat_id: DEBUG_CHAT_ID,
            text: msg,
        }
        return await sendMessageToTelegram(mensaje);
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

    async answerCallbackQuery(id) {
        return await fetch(`${telegramBotUrl}/answerCallbackQuery`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    callback_query_id: id,
                    show_alert: true,
                }),
            });
    }

}

async function sendMessageToTelegram(msg) {
    return await fetch(`${telegramBotUrl}/sendMessage`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(msg),
        });
}

function burlarse(string) {
    string = string.replace(/[aeiou]/g, "i");
    string = string.replace(/[AEIOU]/g, "I");
    string = string.replace(/[áéíóú]/g, "i");
    return string;
}
