import { Request, RequestHandler, Response } from "express";
import { SessionData } from "express-session";

type FlashMessages = "info" | "error" | "success";

export interface Flash<FlashMessageType extends string = string> {
  setFlashMessage: (type: FlashMessageType, message: string) => number;
  setFlashMessages: (type: FlashMessageType, message: string[]) => number;
  flash: (type: FlashMessageType) => string[];
  flashAll: () => Record<FlashMessageType, string[]>;
}
export type FlashMiddleware = <FlashMessageType extends string>(options?: {
  initialize?: FlashMessageType[];
}) => RequestHandler;

declare global {
  namespace Express {
    interface Request {
      Inertia: Inertia;
      flash: Flash<FlashMessages>;
    }
  }
}

declare module "express-session" {
  export interface SessionData {
    flashMessages?: Record<string, string[]>;
    xInertiaCurrentComponent: string | undefined;
    flash: Flash<FlashMessages>;
  }
}

type props = Record<string | number | symbol, unknown | (() => unknown)>;
export type Options = {
  readonly enableReload?: boolean;
  readonly version: string;
  readonly html: (page: Page, viewData: props) => string;
  readonly flashMessages?: (req: Request) => props;
};

export type Page = {
  readonly component: string;
  props: props;
  readonly url: string;
  readonly version: string;
};

export type Inertia = {
  readonly setViewData: (viewData: props) => Inertia;
  readonly shareProps: (sharedProps: props) => Inertia;
  readonly setStatusCode: (statusCode: number) => Inertia;
  readonly setHeaders: (headers: Record<string, string>) => Inertia;
  readonly render: (Page: Page) => Promise<Response>;
  readonly redirect: (url: string) => Response;
};
