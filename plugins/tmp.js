const reload = require('require-reload')(require);
const fs = require("fs");

module.exports = (message, FireBot, GuildData, AuthFile ) => {
   let music = reload("./music.js");
   console.log(music.commands["getqueue"](message.guild.id));
};

function TEMP(message, FireBot, GuildData, AuthFile){
     if (message.mentions.users.array().length === 0) return message.channel.sendMessage("Please supply a user to silence!");
    if (((message.author.id === GuildData.GuildOwner) || (GuildData.Admins[0] !== "ROLE" && (GuildData.Admins.indexOf(message.author.id) > -1 || GuildData.Admins.indexOf("ALL") > -1)) || (GuildData.Admins[0] === "ROLE" && message.member.roles.has(GuildData.Roles.AdminRole))) || (GuildData.Mods[0] !== "ROLE" && (GuildData.Mods.indexOf(message.author.id) > -1) || (GuildData.Mods[0] === "ROLE" && message.member.roles.has(GuildData.Roles.ModRole)))){
        let usr = message.mentions.users.array()[0].id;
        let time = Number(message.content.split(" ")[2]);
        if (!isNaN(time)){console.log(time);}
        //message.channel.overwritePermissions(message.author, {SEND_MESSAGES: false});
        
       /* setTimeout(function(){
            let GuildData = 1 //reload();
            if (false) {
                message.channel.permissionOverwrites.get(usr).delete();
            } else {
                message.channel.overwritePermissions(message.author, {SEND_MESSAGES: true});
            }}, 3000); */

        
    } else {
        let x = "Tsk, Tsk. Your Not a ";
        if (GuildData.Mods[0] === "ROLE"){x += message.guild.roles.get(GuildData.Roles.ModRole).name + " "}else{x += "Mod "}
        x += "or an ";
        if (GuildData.Admins[0] === "ROLE"){x += message.guild.roles.get(GuildData.Roles.AdminRole).name + " "}else{x += "Admin! "}
        x += "You can't silence <@" + message.mentions.users.array()[0].id + ">!";
        message.channel.sendMessage(x);
    }
}