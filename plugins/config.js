const randomID = require("random-id");
const reload = require('require-reload')(require);
const fs = require("fs");

//Role Locks are disabled, the codes not worken...

module.exports = {webconfig, addAdmin, delAdmin, delMod, addMod, disablecmd, enablecmd};

function webconfig(message, bot, AuthFile){
let svr = message.content.split(" ").slice("1").join(" ");
    var vtoken = reload("./../database/webtokens.json");
    let token = randomID(20);
    if ((svr !== "" && svr !== " " && svr != null && bot.guilds.find("name", svr) !== null) || svr === "bot"){
        if (svr === "bot" && message.author.id === AuthFile.botinfo.maintainer){
            //Bot Config
            vtoken.wtokens.push({"token":token, "server":"bot"});
            fs.writeFileSync(__dirname + "/./../database/webtokens.json", JSON.stringify(vtoken));
            message.reply("http://" + AuthFile.Config.Host_URL + ":" + AuthFile.Config.Host_Port + "/login?token=" + token + "&server=bot");
            setTimeout(function(){
                var vtoken = reload("./../database/webtokens.json");
                let i = 0;
                for (i = 0; i < vtoken.wtokens.length; i++) { 
                    if (vtoken.wtokens[i].token === token){
                         vtoken.wtokens.splice(i, 1);
                         fs.writeFileSync(__dirname + "/./../database/webtokens.json", JSON.stringify(vtoken));
            }}}, 30000);
        } else {
            let GuildData = reload("./../database/" + bot.guilds.find("name", svr).id + ".json");
            if ((message.author.id === GuildData.GuildOwner) || (GuildData.Admins[0] !== "ROLE" && (GuildData.Admins.indexOf(message.author.id) > -1 || GuildData.Admins.indexOf("ALL") > -1)) || (GuildData.Admins[0] === "ROLE" && message.member.roles.has(GuildData.Roles.AdminRole))){
                //Guild Config
                vtoken.wtokens.push({"token":token, "server":bot.guilds.find("name", svr).id});
                fs.writeFileSync(__dirname + "/./../database/webtokens.json", JSON.stringify(vtoken));
                message.reply("http://" + AuthFile.Config.Host_URL + ":" + AuthFile.Config.Host_Port + "/login?token=" + token + "&server=" + bot.guilds.find("name", svr).id);
                setTimeout(function(){
                    var vtoken = reload("./../database/webtokens.json");
                    let i = 0;
                    for (i = 0; i < vtoken.wtokens.length; i++) { 
                        if (vtoken.wtokens[i].token === token){
                             vtoken.wtokens.splice(i, 1);
                             fs.writeFileSync(__dirname + "/./../database/webtokens.json", JSON.stringify(vtoken));
                }}}, 30000);
            } else {
                message.reply("Your not a Server Admin! Please speak to a (server) Admin if you belive this is an error.");
            }
        }
    } else {
        message.channel.sendMessage("Please supply a server to configure!");
    }
}

function addAdmin(message, bot, GuildData, AuthFile){
    if (GuildData.Admins[0] === "ROLE") return message.channel.sendMessage("Roles are used on this server. To make a person an Admin put them in the __" + message.guild.roles.get(GuildData.Roles.AdminRole).name + "__ role.");
    if (GuildData.Admins.indexOf(message.author.id) > -1 || GuildData.Admins.indexOf("ALL") > -1 || message.author.id === GuildData.GuildOwner){
        if (message.mentions.users.array().length === 0) return message.channel.sendMessage("Please Supply a user to make an Admin.");
        let usr = message.mentions.users.array()[0].id;
        if (message.mentions.users.array()[0].bot) return message.channel.sendMessage("Erm, I can't add them becuse there a bot.");
        if (GuildData.Admins.indexOf(usr) > -1) {
            return message.channel.sendMessage("Erm, I can't add them becuse there already on the Admin list.");
        } else {
            if (GuildData.Admins.indexOf("ALL") > -1){
                message.channel.sendMessage("<@"+usr+"> is now the __**ONLY**__ admin on the list. Only they can run Admin commands now!");
                let i = 0;
                for (i = 0; i < GuildData.Admins.length; i++) { 
                    if (GuildData.Admins[i] === "ALL"){
                        GuildData.Admins.splice(i, 1);
                        fs.writeFileSync(__dirname + "/./../database/" + message.guild.id + ".json", JSON.stringify(GuildData));
                }}}
            GuildData.Admins.push(usr);
            fs.writeFileSync(__dirname + "/./../database/" + message.guild.id + ".json", JSON.stringify(GuildData));
            return message.channel.sendMessage("<@"+usr+"> is now on the Admin list!");
        }
    } else {
        message.reply("Your not a Server Admin! Please speak to a (server) Admin if you belive this is an error.");
    }
}

function delAdmin(message, bot, GuildData, AuthFile){
    if (GuildData.Admins[0] === "ROLE") return message.channel.sendMessage("Roles are used on this server. To remove an Admin take them out of the __" + message.guild.roles.get(GuildData.Roles.AdminRole).name + "__ role.");
    if (GuildData.Admins.indexOf(message.author.id) > -1 || message.author.id === GuildData.GuildOwner){
        if (message.mentions.users.array().length === 0) return message.channel.sendMessage("Please Supply an Admin  to make an user.");
        if (message.mentions.users.array()[0].bot) return message.channel.sendMessage("Erm, I can't remove them becuse there a bot.");
        if (GuildData.Admins.indexOf("ALL") > -1) return message.channel.sendMessage("So, the admin list is set to \"ALL\". Set an Admin first!");
        let usr = message.mentions.users.array()[0].id;
         if (GuildData.Admins.indexOf(usr) < -1) return message.channel.sendMessage("Sorry about this but there that user is not an Admin.");
        if (GuildData.Admins.indexOf(usr) < 0) {
                return message.channel.sendMessage("Erm, I can't remove them becuse there not on the Admin list.");
        } else {
                let i = 0;
                for (i = 0; i < GuildData.Admins.length; i++) { 
                    if (GuildData.Admins[i] === message.mentions.users.array()[0].id){
                        GuildData.Admins.splice(i, 1);
                        fs.writeFileSync(__dirname + "/./../database/" + message.guild.id + ".json", JSON.stringify(GuildData));
                    }}
                return message.channel.sendMessage("<@"+usr+"> is now not on the Admin list!");
        }
    } else {
        message.reply("Your not a Server Admin! Please speak to a (server) Admin if you belive this is an error.");
    }
}

function addMod(message, bot, GuildData, AuthFile){
    if (GuildData.Mods[0] === "ROLE") return message.channel.sendMessage("Roles are used on this server. To make a person a Mod put them in the __" + message.guild.roles.get(GuildData.Roles.ModRole).name + "__ role.");
    if (GuildData.Admins.indexOf(message.author.id) > -1 || GuildData.Mods.indexOf(message.author.id) > -1 || message.author.id === GuildData.GuildOwner){
        if (message.mentions.users.array().length === 0) return message.channel.sendMessage("Please Supply a user to make an Mod.");
        let usr = message.mentions.users.array()[0].id;
        if (message.mentions.users.array()[0].bot) return message.channel.sendMessage("Erm, I can't add them becuse there a bot.");
        if (GuildData.Mods.indexOf(usr) > -1) {
            return message.channel.sendMessage("Erm, I can't add them becuse there already on the Mod list.");
        } else {
            GuildData.Mods.push(usr);
            fs.writeFileSync(__dirname + "/./../database/" + message.guild.id + ".json", JSON.stringify(GuildData));
            return message.channel.sendMessage("<@"+usr+"> is now on the Mod list!");
        }
    } else {
        message.reply("Your not a Server Admin! Please speak to a (server) Admin if you belive this is an error.");
    }
}

function delMod(message, bot, GuildData, AuthFile){
    if (GuildData.Mods[0] === "ROLE") return message.channel.sendMessage("Roles are used on this server. To remove a Mod take them out of the __" + message.guild.roles.get(GuildData.Roles.ModRole).name + "__ role.");
    if (GuildData.Admins.indexOf(message.author.id) > -1 || GuildData.Mods.indexOf(message.author.id) > -1 || message.author.id === GuildData.GuildOwner){
        if (message.mentions.users.array().length === 0) return message.channel.sendMessage("Please Supply an Mod  to make an user.");
        if (message.mentions.users.array()[0].bot) return message.channel.sendMessage("Erm, I can't remove them becuse there a bot.");
        let usr = message.mentions.users.array()[0].id;
         if (GuildData.Mods.indexOf(usr) < -1) return message.channel.sendMessage("Sorry about this but there that user is not a Mod.");
        if (GuildData.Mods.indexOf(usr) < 0) {
                return message.channel.sendMessage("Erm, I can't remove them becuse there not on the Mod list.");
        } else {
                let i = 0;
                for (i = 0; i < GuildData.Mods.length; i++) { 
                    if (GuildData.Mods[i] === message.mentions.users.array()[0].id){
                        GuildData.Mods.splice(i, 1);
                        fs.writeFileSync(__dirname + "/./../database/" + message.guild.id + ".json", JSON.stringify(GuildData));
                    }}
                return message.channel.sendMessage("<@"+usr+"> is now not on the Mod list!");
        }
    } else {
        message.reply("Your not a Server Admin! Please speak to a (server) Admin if you belive this is an error.");
    }
}

function disablecmd(message, bot, GuildData){
     let cmd = message.content.split(" ").slice("1").join(" ");
     if (cmd === "" && cmd === " " && cmd == null){
         message.channel.sendMessage("You did not give me a Comand!");
     }
     
}

function enablecmd(message, bot, GuildData){
    
}
