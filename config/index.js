// We reuse this import in order to have access to the `body` property in requests
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');

// ℹ️ Responsible for the messages you see in the terminal as requests are coming in
// https://www.npmjs.com/package/morgan
const logger = require("morgan");

// ℹ️ Needed when we deal with cookies (we will when dealing with authentication)
// https://www.npmjs.com/package/cookie-parser
const cookieParser = require("cookie-parser");

// ℹ️ Serves a custom favicon on each request
// https://www.npmjs.com/package/serve-favicon
const favicon = require("serve-favicon");

// ℹ️ global package used to `normalize` paths amongst different operating systems
// https://www.npmjs.com/package/path
const path = require("path");

// Middleware configuration
module.exports = (app) => {
  app.use(session({
    secret: process.env.SECRET,
    store: MongoStore.create({mongoUrl: "mongodb://localhost/OnlyPets"})
  }));

  // In development environment the app logs
  app.use(logger("dev"));

  // To have access to `body` property in the request
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Normalizes the path to the views folder
  const viewsPath = path.join(__dirname, "..", "views");
  const authViewsPath = path.join(viewsPath, "auth-views");
  const personViewsPath = path.join(viewsPath, "person-views");
  const shelterViewsPath = path.join(viewsPath, "shelter-views");
  app.set("views", [viewsPath, authViewsPath, personViewsPath, shelterViewsPath]);
  // Sets the view engine to handlebars
  app.set("view engine", "hbs");
  // Handles access to the public folder
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Handles access to the favicon
  app.use(favicon(path.join(__dirname, "..", "public", "images", "favicon.ico")));
};
