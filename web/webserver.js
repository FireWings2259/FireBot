const express = require("express");
const app = express(); //This is weird but all the tutorials say to do this. And if its not done things break in a weird way.
const session = require('express-session');
const bodyParser = require("body-parser");
const reload = require('require-reload')(require);
const fs = require("fs");
const ejs = require("ejs");

//var vtoken = [{token: "Hi", server: "Nope"}, {token: "Bye", server: "Yes"}];

app.set('view engine', 'ejs');
app.set("views", `${__dirname}/views`);

module.exports = (bot, authFile) => {

app.use(session({
    secret: authFile.Config.SessionKey,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30000 }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res){
  res.render("index.ejs");
});

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  let webfile = reload("./../database/webtokens.json");
  let vtoken = webfile.wtokens;
  
  if (vtoken.length > 0){
  
  let i = 0;
  for (i = 0; i < vtoken.length; i++) { 
    if (req.session.token === vtoken[i].token && req.session.server === vtoken[i].server && vtoken.length > 0 /*&& req.session.admin*/){
      return next();
    }}
      return res.status(401).render("err.ejs", {err: "401"});
  } else{
      return res.status(401).render("err.ejs", {err: "401"});
  }
};

// Login endpoint
app.get('/login', function (req, res) {
    let webfile = reload("./../database/webtokens.json");
  let vtoken = webfile.wtokens;
 //console.log(req.query);
  if (req.query != {}){
    if ((!req.query.token || !req.query.server) && vtoken.length > 0) {
      res.status(401).render("err.ejs", {err: "401"});
    } else {
      let i = 0;
      for (i = 0; i < vtoken.length; i++) { 
        if (req.query.token === vtoken[i].token && req.query.server === vtoken[i].server){
          req.session.server = req.query.server;
          req.session.token = req.query.token;
          //if (req.query.server == "bot"){req.session.bot = true;} else {req.session.bot = false;}
          res.redirect("dash");
          }}
       }
  } else {
    return res.status(401).render("err.ejs", {err: "401"});
  }
});
 
// Logout endpoint
app.post('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});

// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});
 
// Get content endpoint
app.get('/dash', auth, function (req, res) {
    //res.send("You can only see this after you've logged in.");
    //if (req.session.server == "bot"){return res.redirect("send")}
    if (req.session.server != "bot") {
      res.render("dash.ejs", {token: req.session.token, server: req.session.server, guilddata: reload("./../database/" + req.session.server + ".json")});
    } else {
      res.render("dash.ejs", {token: req.session.token, server: req.session.server, guilddata: "NULL"});
    }
    
});

app.get('/send', auth, function(req,res){
  res.render("send.ejs");
});

app.post('/sgmsg', auth, function(req,res){
    var message = req.body.message;
    
  //console.log(message);
    
    let serverList = bot.guilds.array();
    let i = 0;
    for (i = 0; i < serverList.length; i++) { 
      let GuildData = reload("./../database/" + serverList[i].id + ".json");
      if (GuildData.DevMsgs) {
        let channel =  bot.guilds.get(serverList[i].id).defaultChannel;
        channel.sendMessage(message);
        //console.log(serverList[i].name)
    }}
    
    res.status(200);
    res.end("Sent message " + message);
   
   // var channel =  bot.guilds.find("name", "DarkShadows3").defaultChannel;
   //var channel =  bot.guilds.find("name", "DarkShadows3").channels.find("name", "unity-test");
     //  channel.sendMessage(message);


  //res.end("yes");
});

app.post('/config', auth, function(req, res){
  
});


app.listen(authFile.Config.Host_Port,function(){
  console.log("Web Server Started at http://" + authFile.Config.Host_URL + ":" + authFile.Config.Host_Port);
});

};