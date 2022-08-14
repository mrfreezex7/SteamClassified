require("dotenv").config();

const path = require("path");
const async = require("async");
const express = require("express");
const passport = require("passport");
const Database = require("./utility/database");
const FirebaseDB = require("./utility/firebase-db");
const session = require("express-session");
const bodyParser = require("body-parser");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const sharedsession = require("express-socket.io-session");
const helmet = require("helmet");
const compression = require("compression");
const MongoStore = require("connect-mongo");

const server = require("./server");

const passportSetup = require("./config/passport-setup");

const config = require("./config/keys");
const routes = require("./routes/routes");
const page = require("./controllers/error-controller");
const Maintenance = require("./models/Maintenance");
const EJS_Compiler = require("./models/EJS_Compiler");
const { log } = require("./models/Logger");

const app = express();

app.set("view engine", "ejs");
app.enable("view cache");
app.set("views", path.join(__dirname, "views"));

app.set("trust proxy", 1);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());
app.use(compression());

const sessionMiddleware = session({
  key: "session_id",
  secret: config.session.cookieKey,
  resave: false,
  autoSave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
  store: MongoStore.create({ mongoUrl: config.mongodb.dbURI }),
});

app.use(cookieParser());
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);
app.use(page.get404Page);

const port = process.env.PORT || 7777;

Database.Connect()
  .then(() => {
    async.series([
      function (callback) {
        Maintenance.getUpdatedMode(callback);
      },
      function (callback) {
        var expressServer = app.listen(port, function () {
          var host = expressServer.address().address;
          var port = expressServer.address().port;
          log.info("App listening at http://%s:%s", host, port);

          const io = socketio(expressServer);

          log.info("socket connected successfully");

          io.use(sharedsession(sessionMiddleware));

          server.SocketConnect(io);
        });

        callback(null);
      },
    ]);
  })
  .catch((err) => {
    log.info(err);
  });

// setInterval(() => {
//     const used = process.memoryUsage().heapUsed / 1024 / 1024;
//     log.info(`The script uses approximately ${used} MB`);
// }, 2000);
