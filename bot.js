/*console.warn("DUDE, YOU NEED TO INSTALL A NEW NPM PACKAGE!");
console.warn("Its called require-reload and is installed with (npm install require-reload), cmd *in* brackates");
console.warn("Link to npm site: https://www.npmjs.com/package/require-reload");
console.warn(" ");*/

const Discord = require("discord.js");
const fs = require('fs');
const reload = require('require-reload')(require);
var FireBot = new Discord.Client();

console.log("Starting Bot");

console.log("Loading Auth File");
const AuthFile = require("./configure/auth.json");
console.log("-- Auth File Loaded");

console.log("Loading Maintainer File");
const DevFile = require("./configure/maintainer.json");
console.log("-- Maintainer File Loaded");

console.log("Loading Web Server");
const WebServer = require("./web/webserver.js");
console.log("-- Web Server");
const ConfigPlugin = require("./plugins/config.js");
console.log("-- Config");

console.log("Loading Plugins");
const BasePlugin = require("./plugins/base.js");
console.log("-- Base");
const MusicPlugin = require("./plugins/music.js");
console.log("-- Music");


console.log("Loading Help");
const HelpPlugin = require("./plugins/help.js");
console.log("-- Help Loaded!");

function checkfile(guild){
        if (!fs.existsSync("./database/" + guild.id + ".json")) {
        console.log("Whoa Man! New Server! " + guild.name + " Has joined the bot.");
        console.log("Lets make a config for them.");
        let template = require("./database/template.json");
        fs.writeFileSync("./database/" + guild.id + ".json", JSON.stringify(template));
        console.log("Done new config file: " + guild.id + ".json");
    }
}

function WebFile(){
    if (!fs.existsSync("./database/webtokens.json")) {
    fs.writeFileSync("./database/webtokens.json", JSON.stringify({"wtokens":[]}));
    } else{
        fs.unlinkSync("./database/webtokens.json");
        WebFile();
    }
}

FireBot.once("ready", function () {
   WebFile();
   if (AuthFile.Config.WebServer){
    console.log("Web Server Active");   
    WebServer(FireBot, AuthFile);
   } else {
    console.log("Web Server IS NOT ENABLED");
   }
});

// Place holders
FireBot.on("guildCreate", function (guild) {
    //console.log("Woo new server! Welcome" + guild.name); //Not needed
    checkfile(guild);
});

FireBot.on("guildDelete", function (guild) {
    console.log(":( We lost a server. Goodbye " + guild.name);
    if(AuthFile.Config.DelOldServers){
        console.log("Clean Up is enabled, deleting the servers config file!"); 
        fs.unlinkSync("./database/" + guild.id + ".json");
        console.log("File " + guild.id + ".json has been removed!");
    } else {
        console.log("Server file not deleted! File build up can be a thing!");
    }
});

FireBot.on("guildMemberAdd", function (member) {
    console.log("So @" + member.id + " joined " + member.guild.name);
    
    // Welcome message here
});

FireBot.on("guildMemberRemove", function (member) {
    let x = "So @" + member.id; 
    if (member.id === FireBot.user.id){x += " (Me!)"}
    x += " left " + member.guild.name;
    console.log(x);
    
    // When someone leaves or is removed
});


console.log("Listening for commands");
FireBot.on("message", function (message) {
    
    if (message.channel.type === 'dm') return console.log("Thats a DM! I can't touch that yet :("); //for now
    
    checkfile(message.guild);
    
    let GuildData = reload("./database/" + message.guild.id + ".json"); //useing reload to *reload* the guild file each time. This allows for guild setting to be updated without a server restart!
    
    if (message.author.bot) return;
    if (!message.content.startsWith(GuildData.CommandKey)) return;
    var cmd = message.content.toLowerCase().substring(1).split(" ")[0];
    var msg = message.content.split(" ").slice("1").join(" ");
    var cmdup = cmd.toUpperCase();
    
    console.log("cmd: " + cmd);
    console.log("msg: " + msg);
    console.log(`GuildData: ${GuildData.CommandKey}`);
    console.log("Delete Command? " + GuildData.DelCmd);
    
    if (GuildData.DelCmd){message.delete();} //If DelCmd Delete Command
    
    //Base Commands, These are hard coded in for ease and becuse there base/core functions NOT plugins, even tho they have individual .js files.
    if (cmdup === GuildData.Commands.Help){HelpPlugin.help(message, GuildData)} //Help Command
    if (cmdup === GuildData.Commands.Base.invite.cmd && GuildData.Commands.Base.invite.enabled){BasePlugin.invite(message, FireBot)} //Invite the bot to a server.
    
    //Bot Config Commands
    if (cmdup === GuildData.Commands.Config.webconfig & AuthFile.Config.WebServer){ConfigPlugin.webconfig(message, FireBot, AuthFile)}
    if (cmdup === GuildData.Commands.Config.aadmin.cmd && GuildData.Commands.Config.aadmin.enabled){ConfigPlugin.addAdmin(message, FireBot, GuildData, AuthFile)}
    if (cmdup === GuildData.Commands.Config.dadmin.cmd && GuildData.Commands.Config.dadmin.enabled){ConfigPlugin.delAdmin(message, FireBot, GuildData, AuthFile)}
    if (cmdup === GuildData.Commands.Config.amod.cmd && GuildData.Commands.Config.amod.enabled){ConfigPlugin.addMod(message, FireBot, GuildData, AuthFile)}
    if (cmdup === GuildData.Commands.Config.dmod.cmd && GuildData.Commands.Config.dmod.enabled){ConfigPlugin.delMod(message, FireBot, GuildData, AuthFile)}
    if (cmdup === "DISCMD"){ConfigPlugin.disablecmd(message, FireBot, GuildData)}
    if (cmdup === "ENCMD"){ConfigPlugin.enablecmd(message, FireBot, GuildData)}
    
    
    if (cmdup === "TMP"){
        //let tmp = reload("./plugins/tmp.js");
        //tmp(message, FireBot, GuildData, AuthFile);.
        reload("./plugins/tmp.js")(message, FireBot, GuildData, AuthFile);
    }
    
    if (cmdup === "HALT" & message.author.id === AuthFile.botinfo.maintainer){message.channel.sendMessage("k Bye!"); FireBot.user.setStatus('idle'); FireBot.destroy()} //idle works, somehow...
    
    //Start Music Plugin
    if ((GuildData.Commands.Music.functions.includes(cmdup) && (GuildData.Commands.Music.functions.indexOf(cmdup) > -1 && GuildData.Commands.Music.functions.indexOf(cmdup) < 5)) && GuildData.Commands.Music.enabled.all /*&& DevFile.Developers.includes(message.author.id)*/) {
        console.log("Music Command: " + cmd);
        MusicPlugin.musicplugin(message, msg, cmd, GuildData);
    }
});

console.log("Good job everyone, we made it.");
console.log("**Applause**");
FireBot.login(AuthFile.botinfo.token);