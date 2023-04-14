const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// These id's and secrets should come from .env file.
const CLIENT_ID = '1043817259984-c4u178i4borp3e7laievif1tdgbnjk4c.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//046XTyk7vAXA_CgYIARAAGAQSNwF-L9IrAbW_4jrOdiHgBIpx4ftJyIMrgPsnXYhgUw_-yugdM4p0BAI13_W0nXALX7StuiUNJhI';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, username, id) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'janice.hc.shih@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'PathoRadi <janice.hc.shih@gmail.com>',
      to: email,
      subject: 'Email from PathoRadi Team',
      text: `Hello ${username} Your proccess id is pathoradi_${id}.`,
      html: `<div>Hello ${username}</div><div> Your proccess id is pathoradi_${id}.</div>`,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

async function sendToAdmin(username, id) {
    try {
      const accessToken = await oAuth2Client.getAccessToken();
  
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'janice.hc.shih@gmail.com',
          clientId: CLIENT_ID,
          clientSecret: CLEINT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      const localURL = 'http://localhost:3000/uploadInfo';
      const pathoradiURL = 'https://prbase.azurewebsites.net/uploadInfo'
  
      const mailOptions = {
        from: 'PathoRadi <janice.hc.shih@gmail.com>',
        to: 'chaohsiung.hsu@howard.edu;tsangwei.tu@howard.edu;hsiuchuan.shih@howard.edu',
        subject: `New Upload Info from ${username}`,
        text: `New Upload Info from ${username}, download here: ${pathoradiURL}/${id}`,
        html: `<div>New Upload Info from ${username}.</div><div> Download here: <a href='${pathoradiURL}/${id}'>${pathoradiURL}/${id}</a></div>`,
      };
  
      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      return error;
    }
  }


var express = require('express');
var router = express.Router();

const mysql = require("mysql");

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

/* GET uploadInfo listing. */
router.get('/', function(req, res, next) {
  res.send({
    message: 'upload info'
  });
});

router.post("/create", (req, res) => {
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
      else {
        sendMail(email, username, results.insertId)
        .then((result) => console.log('Email sent...', result))
        .catch((error) => console.log(error.message));

        sendToAdmin(username, results.insertId)
        .then((result) => console.log('Email sent...', result))
        .catch((error) => console.log(error.message));
        
        res.end(JSON.stringify(results))
      }
    }
  );
});


router.get("/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        " SELECT * FROM  upload_info WHERE userid=?",[id],
        (err, results, fields) => {
            if (err) throw err;
            else res.end(JSON.stringify(results));
        }
    )

});

module.exports = router;
