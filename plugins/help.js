module.exports = {help};

function help(message, gconfig){
    let cmd = gconfig.Commands;
    let key =  gconfig.CommandKey;
    
    let x = "```UnityBot Help\nThis is the help documentation for " + message.guild.name + ".\nThe following commands are usable in this server.\nNOTE: Anything before the -- is part of the command.\n";
    x += "\n" + key + cmd.Help.toLowerCase() + " -- Will show this help";
    if(cmd.Base.invite.enabled){x += "\n" + key + cmd.Base.invite.cmd.toLowerCase() + " -- Will give you a link to invite the bot to a new server!"}
    
    if (cmd.Music.enabled){
        x += "\n\nThe following are used to control the MusicBot part of UnityBot";
        x += "\n" + key + cmd.Music.functions[1].toLowerCase() + " https://www.youtube.com/watch?v=dQw4w9WgXcQ -- Will add a song to the music queue.";
        x += "\n" + key + cmd.Music.functions[0].toLowerCase() + " -- Will play the youtube videos in the queue.";
        x += "\n" + key + cmd.Music.functions[3].toLowerCase() + " -- Will join the voice channel that your in, *without* playing anything.";
        x += "\n" + key + cmd.Music.functions[4].toLowerCase() + " -- Will list the youtube videos in the queue.";
        x += "\n" + key + cmd.Music.functions[6].toLowerCase() + " -- Will pause the current song.";
        x += "\n" + key + cmd.Music.functions[7].toLowerCase() + " -- Will unpause the current song.";
        x += "\n" + key + cmd.Music.functions[8].toLowerCase() + " -- Will completly stop the MusicBot and will clear the queue.";
        x += "\n" + key + cmd.Music.functions[9].toLowerCase() + " 10% -- Will turn the volume of the bot up by the supplied %.";
        x += "\n" + key + cmd.Music.functions[10].toLowerCase() + " 10% -- Will turn the volume of the bot down by the supplied %.";
        x += "\n" + key + cmd.Music.functions[11].toLowerCase() + " -- Will show the ammount of time the song has been playing for.";
    }
    
    x += "```";
    
    message.channel.sendMessage(x);
}