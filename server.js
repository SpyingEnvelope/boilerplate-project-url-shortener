require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mySecretURI = process.env['MONGO_URI'];
const dns = require('dns');
const Schema = mongoose.Schema;

//Regex for http testing
const httpRegex = /https?:\/\//

//Connect to database
mongoose.connect(mySecretURI, { useNewUrlParser: true, useUnifiedTopology: true});

//Schema to store URL
const urlSchema = new Schema ({
  'original_url': {
    type: String,
    required: true
  },
  'short_url': {
    type: Number,
    required: true
  }
})

//Create Model
const URLaddress = mongoose.model('Address', urlSchema);

//Body Praser for post requests
app.use(bodyParser.urlencoded({extended: false}));



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Handle post request
app.post("/api/shorturl", (req, res) => {
  console.log(req.body);
  
  if(httpRegex.test(req.body.url) == false) {
    console.log('sending back invalid url')
    res.json({ error: 'invalid url'})
  } else {
   //count number of URLs in databse
  URLaddress.find().count((err, count) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {

    // create newURL after retrieving count  
    const newURL = new URLaddress({
    'original_url': req.body.url,
    'short_url': count + 1
    })

    // save newURL to server
    newURL.save((err, data) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
     console.log('sending back json file');
     res.json({ original_url : req.body.url, short_url : count + 1});
    }
    })
    }
   });
  }


  
})

app.get("/api/shorturl/:short", (req, res) => {
  console.log('i am here');
  URLaddress.find({short_url: req.params.short}, (err, data) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      console.log(data);
      res.redirect(data[0]['original_url']);
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
