import { ProcessUpdate } from "./process_update.mjs";

export const handler = async (event, context) => {
    // Message
    let update = JSON.parse(event.body);
    // console.log("update", update);

    let proc = new ProcessUpdate(update);

    if (!proc) {
        return context.succeed();
    }

    return proc.doProcess(context);

}