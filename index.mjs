import { ProcessUpdate } from "./process_update.mjs";

export const handler = async (event, context) => {
    // Message
    let update = JSON.parse(event.body);

    let proc = new ProcessUpdate(update);

    if (!proc.chat_id) {
        return context.succeed();
    }

    return proc.doProcess(context);

}