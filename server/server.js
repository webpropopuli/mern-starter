const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const Data = require("./data");
const cors = require("cors");

const API_PORT = 3001;
const app = express();
const router = express.Router();

// this is our MongoDB database
const dbRoute = "mongodb+srv://webdev1:0uNMs6QiMMVLIaa7@clusterwebdev-d9chb.mongodb.net/MERN1";

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });
mongoose.set("useFindAndModify", false);

let db = mongoose.connection;

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//TBD prolly wrap in conditional if error hits
db.once("open", () => console.log("connected to the database"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

router.get("/", (req, res) => {
  return res.send("I'm a server. Don't talk to me like that!");
});

// this is our get method
// this method fetches all available data in our database
router.get("/getData", (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });

    console.log(`SRV->GET ret ${data.length} items`);
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
  console.log("SRV->UPDATE");
  const { id, update } = req.body;
  console.log(`SRV: ${id}, ${update}`);
  console.log(update);
  Data.findByIdAndUpdate(id, update, err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  console.log("SRV->DEL");
  const { id } = req.body;
  Data.findOneAndDelete(id, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// this is our create methid
// this method adds new data in our database
router.post("/putData", (req, res) => {
  let data = new Data();
  console.log("SRV->PUT");
  const { id, message } = req.body;

  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: "INVALID INPUTS"
    });
  }
  data.message = message;
  data.id = id;
  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
