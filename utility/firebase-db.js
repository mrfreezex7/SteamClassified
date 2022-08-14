const config = require("../config/keys");
const admin = require("firebase-admin");

const serviceAccount = config.firebase.serviceKey;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const _db = admin.firestore();

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.getDb = getDb;
