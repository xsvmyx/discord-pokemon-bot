const {Client , IntentsBitField } = require('discord.js');
require('dotenv').config();
const mongoose = require('mongoose');

const { guess } = require('./commands/guess-name');
const {setLang} = require('./commands/lang')
const {guess_gen} = require('./commands/guess-gen');
const {guess_types} = require("./commands/guess-types");
const {help} = require("./commands/help");
const {daily} = require("./commands/daily");
const {check} = require("./commands/check");
const {shop} = require("./commands/shop");


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
        
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.GuildPresences,

    ]

})







client.on('clientReady', (c) => {
    console.log(`############# ${c.user.tag} is online`);

});
                

client.on("messageCreate", msg => {
  if(msg.author.bot) return;

  //console.log(msg.content);
    
    if(msg.content === "shbob")
        msg.react("😀");
        

   
});




client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {

        case 'guess-name':
            await guess(interaction);
            break;

        case 'lang':
            await setLang(interaction);
            break;
        case 'guess-gen':
            await guess_gen(interaction);
            //interaction.reply('awwwwww');
            break;
        case 'guess-types':
            await guess_types(interaction);
            break; 
        case 'help':
            await help(interaction);
            break;
        case 'daily':
            await daily(interaction);   
            break;    
        case 'check':
            await check(interaction);
            break;
        case 'shop':
            await shop(interaction);
            break;   

        default:
            console.log(`Unknown command: ${interaction.commandName}`);
    }
});




(async () => {
    try {
        await mongoose.connect(
            process.env.DB_URI
            
        );
        console.log("OKKK");

        
    } catch (e) {
        console.log("ERRRRR:", e);
    }
})(); 


client.login(process.env.TOKEN)



// 🔧 Render keep-alive 
const http = require("http");


const server = http.createServer((req, res) => {
  // mini activité non persistante
  const work = Math.sqrt(Math.random() * Date.now());

  console.log(`[PING] work=${work}`);

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running");
});

server.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Dummy HTTP server running");
});
