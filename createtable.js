const express = require("express");
const app = express();
const mysql = require("mysql");

const cors = require("cors");

app.use(cors());
app.use(express.json())

const fs = require("fs");
var config = {
  host: "prbase.mysql.database.azure.com",
  user: "prbase",
  password: "2Axijoll@",
  database: "prbase",
  port: 3306,
  ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") },
};

const db = new mysql.createConnection(config);

app.post("/create", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const project = req.body.project;
  const thickness = req.body.thickness;
  const pixel = req.body.pixel;
  const sample = req.body.sample;
  const rawImages = req.body.rawImages;

  db.query(
    "INSERT INTO upload_info (username, email, project, thickness, pixel, sample, rawImages) VALUES (?, ?, ?, ?, ?, ?, ?);",
    [username, email, project, thickness, pixel, sample, rawImages],
    (err, results, fields) => {
      if (err) throw err;
      else console.log("Inserted " + results.affectedRows + " row(s).");
    }
  );
});

app.listen(3001, () => {console.log('run api')});
