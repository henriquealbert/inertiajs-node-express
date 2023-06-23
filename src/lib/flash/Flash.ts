import { Request } from "express";
import { SessionData } from "express-session";

type MessagesRecord = Record<string, string[]>;

export class Flash<FlashMessageType extends string = string> {
  private req: Request & {
    session?: SessionData & { flashMessages?: MessagesRecord };
  };

  constructor(
    req: Request & {
      session?: SessionData & { flashMessages?: MessagesRecord };
    }
  ) {
    this.req = req;
  }

  setFlashMessage(type: FlashMessageType, message: string) {
    const messagesRecord: MessagesRecord =
      this.req.session!.flashMessages || {};

    if (messagesRecord[type]) {
      messagesRecord[type].push(message);
    }
    messagesRecord[type] = [message];

    return messagesRecord[type].length;
  }

  setFlashMessages(type: FlashMessageType, messages: string[]) {
    const messagesRecord: MessagesRecord =
      this.req.session!.flashMessages || {};
    if (!messagesRecord[type]) {
      messagesRecord[type] = messages;
    }
    messages.forEach((singleMessage) => {
      messagesRecord[type].push(singleMessage);
    });
    return messagesRecord[type].length;
  }

  flash(type: FlashMessageType) {
    const messagesRecord: MessagesRecord =
      this.req.session!.flashMessages || {};

    const msgs = messagesRecord[type];
    delete messagesRecord[type];
    return msgs;
  }

  flashAll() {
    const messagesRecord: MessagesRecord =
      this.req.session!.flashMessages || {};

    delete this.req.session!.flashMessages;
    return messagesRecord;
  }
}
