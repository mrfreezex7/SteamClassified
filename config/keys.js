module.exports = {
  maintenance: {
    current: false,
  },
  session: {
    cookieKey: process.env.COOKIE_KEY,
  },
  website: {
    mainURL: process.env.WEBSITE_URL,
  },
  mongodb: {
    dbURI: process.env.MONGO_DB,
  },
  firebase: {
    serviceKey: JSON.parse(process.env.FIREBASE_SERVICE_KEY),
  },
  passportOption: {
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
  },
  TestBot: {
    apiKey: process.env.TESTBOT_API_KEY,
  },
};
