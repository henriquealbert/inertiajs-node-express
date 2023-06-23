import express from "express";
import session from "express-session";
import { inertiaFlashMiddleware, inertiaExpressMiddleware } from "./lib";

const app = express();

// Configuring Express session.
// In this example, we are using the express-session session middleware.
// The secret is used to sign the session ID. This can be any string value.
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Initializing the Flash middleware.
app.use(inertiaFlashMiddleware());

const router = express.Router();

// Defining a GET route for '/home'.
// This route will respond with a JSON object when accessed with a GET method.
router.get("/home", async (req, res, next) => {
  // If the flash middleware was added, you can set a flash message.
  // Here we are setting a success flash message.
  req.flash.setFlashMessage("success", "User created successfully");

  // Using the Inertia middleware to render an Inertia component.
  // The object passed to the render method includes the component name, props, URL, and version.
  req.Inertia.render({
    component: "home",
    props: { name: 1 },
    url: "/home",
    version: "1.0",
  });
});

// Using the Inertia middleware.
// An object of configuration is passed to the middleware.
// This object includes the version, a method to generate the HTML, and a method to retrieve all flash messages.
app.use(
  inertiaExpressMiddleware({
    version: "1.0",
    html: (page, viewData) => `<!DOCTYPE html>
      <html>
      <body>
        <div id="app" data-page='${JSON.stringify(page)}'>Oieee</div>
      </body>
      </html>`,
    flashMessages: (req) => req.flash.flashAll(),
  })
);

// Using the Express router.
// This should be done after all middlewares have been defined.
app.use(router);

// Start server
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
