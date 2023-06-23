import { Flash } from "./Flash";
import { FlashMiddleware } from "../types";

export const inertiaFlashMiddleware: FlashMiddleware = <
  FlashMessageType extends string = string
>(
  options: {
    initialize?: FlashMessageType[];
  } = {}
) => {
  return async (req, _res, next) => {
    if (!req.session) {
      throw new Error(
        "Express flash requires a session middleware to be added before"
      );
    }

    // @ts-ignore
    req.flash = new Flash(req);
    options.initialize?.forEach((type) => {
      if (!req.session.flashMessages) {
        req.session.flashMessages = {};
      }
      if (!req.session.flashMessages[type]) {
        req.session.flashMessages[type] = [];
      }
    });
    return next();
  };
};
