import { RequestHandler } from "express";
import { Inertia, Options, Page } from "../types";
import { headers } from "./headers";

type props = Record<string | number | symbol, unknown | (() => unknown)>;

export const createInertiaMiddleware = (options: Options): RequestHandler => {
  const { version, html, flashMessages, enableReload = false } = options;

  return (req, res, next) => {
    if (
      req.method === "GET" &&
      req.headers[headers.xInertia] &&
      req.headers[headers.xInertiaVersion] !== version
    ) {
      if (req.session && req.session.flash) {
        req.session.flash.flashAll();
      }
      return res.writeHead(409, { [headers.xInertiaLocation]: req.url }).end();
    }

    let _viewData = {};
    let _sharedProps: props = {};
    let _statusCode = 200;
    let _headers: Record<string, string | string[] | undefined> = {};

    const Inertia: Inertia = {
      setViewData(viewData) {
        _viewData = viewData;
        return this;
      },

      shareProps(sharedProps) {
        _sharedProps = { ..._sharedProps, ...sharedProps };
        return this;
      },

      setStatusCode(statusCode) {
        _statusCode = statusCode;
        return this;
      },

      setHeaders(headers) {
        _headers = { ..._headers, ...headers };
        return this;
      },
      async render({ component, props }) {
        const _page: Page = {
          component,
          url: req.originalUrl || req.url,
          version,
          props,
        };

        if (flashMessages) {
          this.shareProps(flashMessages(req));
        }
        if (enableReload) {
          req.session.xInertiaCurrentComponent = component;
        }
        const allProps = { ..._sharedProps, ...props };

        let dataKeys;
        const partialDataHeader = req.headers[headers.xInertiaPartialData];
        if (
          partialDataHeader &&
          req.headers[headers.xInertiaPartialComponent] === _page.component &&
          typeof partialDataHeader === "string"
        ) {
          dataKeys = partialDataHeader.split(",");
        } else {
          dataKeys = Object.keys(allProps);
        }

        // we need to clear the props object on each call
        const propsRecord: props = {};
        for await (const key of dataKeys) {
          let value;
          if (typeof allProps[key] === "function") {
            value = await (allProps[key] as () => unknown)();
          } else {
            value = allProps[key];
          }
          propsRecord[key] = value;
        }
        _page.props = propsRecord;

        if (req.headers[headers.xInertia]) {
          res
            .status(_statusCode)
            .set({
              ..._headers,
              "Content-Type": "application/json",
              [headers.xInertia]: "true",
              Vary: "Accept",
            })
            .send(JSON.stringify(_page));
        } else {
          res
            .status(_statusCode)
            .set({
              ..._headers,
              "Content-Type": "text/html",
            })
            .send(html(_page, _viewData));
        }
        return res;
      },

      redirect(url) {
        const statusCode = ["PUT", "PATCH", "DELETE"].includes(req.method)
          ? 303
          : 302;
        res.redirect(statusCode, url);
        return res;
      },
    };

    req.Inertia = Inertia;

    return next();
  };
};
