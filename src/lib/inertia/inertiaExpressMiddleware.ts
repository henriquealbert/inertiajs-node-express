import { RequestHandler } from "express";
import { Options } from "../types";
import { createInertiaMiddleware } from "./inertia";

export const inertiaExpressMiddleware: (options: Options) => RequestHandler = (
  options
) => createInertiaMiddleware(options);
