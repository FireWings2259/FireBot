module.exports = {invite, mute};

function invite(message, bot){
    message.reply("Here is the invite link for __**" + bot.user.username + "**__");
    message.channel.sendMessage("https://discordapp.com/oauth2/authorize?&client_id=" + bot.user.id + "&scope=bot&permissions=470019135");
}

function mute(message, bot){
    
}