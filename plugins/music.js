

//var musiclib = ["https://www.youtube.com/watch?v=gh1sbCaSrmA", "https://www.youtube.com/watch?v=tG3k5Zu5vDc", "https://www.youtube.com/watch?v=_ljaqUN0QqQ", "https://www.youtube.com/watch?v=6ctLWL3Ipqs", "https://www.youtube.com/watch?v=6aQHNwYCwuE"];

const yt = require("ytdl-core");
//const funclist = ["PLAY","ADDSONG","ADMINADDSONG", "JOIN", "QUEUE","PAUSE","RESUME","STOP","SKIP","VOLUMEU","VOLUMED","TIME"];
var queue = {};

const commands = {
    'play': (message, msg, GuildData) => {
        //console.log("Play step 1!");
       // console.log(`Play GuildData = ${GuildData.CommandKey}`);
       // console.log(queue);
       // console.log(`Author = ${message.author}`);

        if (queue[message.guild.id] === undefined) return message.channel.sendMessage(`There are no songs in the queue, to add a song use: ${GuildData.CommandKey}${GuildData.Commands.Music.functions[1].toLowerCase()}`);
        if (!message.guild.voiceConnection) return commands.join(message).then(() => commands.play(message, msg, GuildData));
        if (queue[message.guild.id].playing) return message.channel.sendMessage('Already Playing');
        let dispatcher;
        queue[message.guild.id].playing = true;

        (function play(song) {
            if (queue.adminlist)
            console.log("Play step 2!");
            // console.log(`Play song = ${song}`);
            console.log(`Author = ${message.author}`);
            if (song === undefined) return message.channel.sendMessage('The queue is empty').then(() => {
                queue[message.guild.id].playing = false;
                message.member.voiceChannel.leave();
            });
            console.log("1");
            message.channel.sendMessage(`Playing: **${song.title}**, requested by: **${song.requester}**`);
            console.log("2");
            dispatcher = message.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }));
            console.log("3");
            let collector = message.channel.createCollector(m => m);
            console.log("4");
            collector.on('message', m => {
                
                if (m.content.toLowerCase().startsWith(GuildData.CommandKey + GuildData.Commands.Music.functions[5].toLowerCase())) {
                    message.channel.sendMessage("Paused song").then(() => { dispatcher.pause(); });
                } else if (m.content.toLowerCase().startsWith(GuildData.CommandKey + GuildData.Commands.Music.functions[6].toLowerCase())) {
                    message.channel.sendMessage("Resumed song").then(() => { dispatcher.resume(); });
                } else if (m.content.toLowerCase().startsWith(GuildData.CommandKey + GuildData.Commands.Music.functions[8].toLowerCase())) {
                    message.channel.sendMessage("Skipped song").then(() => { dispatcher.end(); });
                } else if (m.content.toLowerCase().startsWith(GuildData.Commands.Music.functions[9].toLowerCase())) {
                    if (Math.round(dispatcher.volume * 50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                    dispatcher.setVolume(Math.min((dispatcher.volume * 50 + (2 * (m.content.split('+').length - 1))) / 50, 2));
                    message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                } else if (m.content.toLowerCase().startsWith(GuildData.Commands.Music.functions[10].toLowerCase())) {
                    if (Math.round(dispatcher.volume * 50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                    dispatcher.setVolume(Math.max((dispatcher.volume * 50 - (2 * (m.content.split('-').length - 1))) / 50, 0));
                    message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                } else if (m.content.toLowerCase().startsWith(GuildData.CommandKey + GuildData.Commands.Music.functions[11].toLowerCase())) {
                    message.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? '0' + Math.floor((dispatcher.time % 60000) / 1000) : Math.floor((dispatcher.time % 60000) / 1000)}`);
                }  else if (m.content.toLowerCase().startsWith(GuildData.CommandKey + GuildData.Commands.Music.functions[7].toLowerCase())) {
                    if (message.member.voiceChannel !== message.guild.voiceConnection.channel) {return message.reply("You must be in the Voice Channel " + message.guild.voiceConnection.channel + " to stop songs.")} //basic kill
                    message.channel.sendMessage("<@" + message.author.id + ">" + " has stopped the music bot.");
                    message.channel.sendMessage("Good Day!");
                    queue[message.guild.id].stop = true;
                    collector.stop();
                    dispatcher.end();
                    message.guild.voiceConnection.channel.leave();
                }
                
            });
            dispatcher.on("end", () => {
                collector.stop();
                if (!queue[message.guild.id].loop) {queue[message.guild.id].songs.shift();}
                if (queue[message.guild.id].stop === false){play(queue[message.guild.id].songs[0]);} //!queue[message.guild.id].stop was being a derp
                queue[message.guild.id].stop = false;
            });
            dispatcher.on("error", (err) => {
                return message.channel.sendMessage("error: " + err).then(() => {
                    collector.stop();
                    queue[message.guild.id].songs.shift();
                    play(queue[message.guild.id].songs[0]);
                });
            });
        })(queue[message.guild.id].songs[0]);
    },

    'join': (message) => {
        return new Promise((resolve, reject) => {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel || voiceChannel.type !== "voice") return message.reply("I couldn't connect to your voice channel...");
            voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
        });
    },

    'addsong': (message, msg) => {
        if (msg === undefined || msg === "") return message.reply("You didn't give me a youtube link?");
        let url = msg;
        console.log(`Url = ${url}`);
        yt.getInfo(url, (err, info) => {
            if (err) return message.channel.sendMessage("That youtube link was invalid?: " + err);
            if (!queue.hasOwnProperty(message.guild.id)) {
                queue[message.guild.id] = {};
                queue[message.guild.id].songs = [];
                queue[message.guild.id].adminlist = [];
                queue[message.guild.id].playing = false;
                queue[message.guild.id].adminplaying = false;
                queue[message.guild.id].loop = false;
                queue[message.guild.id].stop = false;
            }
            queue[message.guild.id].songs.push({ url: url, title: info.title, requester: message.author.username });
            message.channel.sendMessage(`added **${info.title}** to the queue`);
        });
    },

    'adminaddsong': (message, msg) => {
        if (msg === undefined) return message.reply("There was no link mr/miss.admin");
        let url = msg;
        console.log(`Url = ${url}`);
        yt.getInfo(url, (err, info) => {
            if (err) return message.channel.sendMessage("Invalid youtube link admin?: " + err);
            if (!queue.hasOwnProperty(message.guild.id)) {
                queue[message.guild.id] = {};
                queue[message.guild.id].songs = [];
                queue[message.guild.id].adminlist = [];
                queue[message.guild.id].playing = false;
                queue[message.guild.id].adminplaying = false;
                queue[message.guild.id].loop = false;
            }
            queue[message.guild.id].adminlist.push({ url: url, title: info.title, requester: message.author.username });
            message.channel.sendMessage(`added **${info.title}** to the admin list`);
        });
    },
    'queue': (message, GuildData) => {
        console.log(`GuildData Queue = ${GuildData}`);
        if (queue[message.guild.id] === undefined) return message.channel.sendMessage(`Add some songs to the queue first with ${GuildData.CommandKey}${GuildData.Commands.Music.functions[1].toLowerCase()}`);
        let tosend = [];
        queue[message.guild.id].songs.forEach((song, i) => { tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`); });
        message.channel.sendMessage(`__**${message.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0, 15).join('\n')}\`\`\``);
    },
    
    'loop': (message, GuildData) => {
        if (queue[message.guild.id] === undefined) return message.channel.sendMessage(`Add some songs to the queue first with ${GuildData.CommandKey}${GuildData.Commands.Music.functions[1].toLowerCase()}`);
        if (queue[message.guild.id].loop){message.channel.sendMessage("No longer looping, as per " + "<@" + message.author.id + ">" + "'s request"); queue[message.guild.id].loop = false}
        else {message.channel.sendMessage("Now looping the song: " + queue[message.guild.id].songs[0].title + " By " + "<@" + message.author.id + ">"); queue[message.guild.id].loop = true}
    },
    
    'getqueue': (guildid) => {
      return queue[guildid];
    },
};

module.exports = { musicplugin, commands, isenabled};

function musicplugin(message, msg, cmd, GuildData) {
    console.log(`plugin GuildData = ${GuildData.CommandKey}`);
  
    if (cmd === GuildData.Commands.Music.functions[0].toLowerCase()){cmd = "play"}
    else if (cmd === GuildData.Commands.Music.functions[1].toLowerCase()){cmd = "addsong"}
    else if (cmd === GuildData.Commands.Music.functions[2].toLowerCase()){cmd = "adminaddsong"}
    else if (cmd === GuildData.Commands.Music.functions[3].toLowerCase()){cmd = "join"}
    else if (cmd === GuildData.Commands.Music.functions[4].toLowerCase()){cmd = "queue"}
    if (!isenabled(cmd, GuildData)){return message.channel.sendMessage("Hey that command is not enabled")}
    
    commands[cmd](message, msg, GuildData);
}

function isenabled(cmd, GuildData){
    console.log(GuildData.Commands.Music.functions.indexOf(cmd));
    if (GuildData.Commands.Music.enabled[cmd]) {
        return true;
    } else {
        return false;
    }
}