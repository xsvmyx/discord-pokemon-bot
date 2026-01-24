const {Client , IntentsBitField } = require('discord.js');
//require('dotenv').config();
const mongoose = require('mongoose');
const { Events } = require('discord.js');


const { guess } = require('./commands/guess-name');
const {setLang} = require('./commands/lang')
const {guess_gen} = require('./commands/guess-gen');
const {guess_types} = require("./commands/guess-types");
const {help} = require("./commands/help");
const {daily} = require("./commands/daily");
const {check} = require("./commands/check");
const {shop} = require("./commands/shop");
const {myPokemons} = require("./commands/my-pokemons");


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








client.once(Events.ClientReady, (c) => {
    console.log(`############# ${c.user.tag} is online`);
})         

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
        case 'my-pokemons':
            await myPokemons(interaction);
            break;  

        default:
            console.log(`Unknown command: ${interaction.commandName}`);
    }
});




// Ajoute ces listeners AVANT le login
client.on('debug', console.log);
client.on('warn', console.warn);
client.on('error', console.error);

client.on('shardError', error => {
    console.error('❌ Shard error:', error);
});

client.on('shardDisconnect', (event, id) => {
    console.log('🔌 Shard disconnected:', id, event);
});

client.on('shardReconnecting', id => {
    console.log('🔄 Shard reconnecting:', id);
});

(async () => {
    try {
        console.log("🔍 TOKEN présent?", !!process.env.TOKEN);
        console.log("🔍 TOKEN length:", process.env.TOKEN?.length);
        console.log("🔍 DB_URI présent?", !!process.env.DB_URI);
        
        await mongoose.connect(process.env.DB_URI);
        console.log("✅ DB OK");
        
        console.log("🔄 Tentative de connexion Discord...");
        
        const loginPromise = client.login(process.env.TOKEN);
        
        // Timeout de 30 secondes
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('⏱️ Timeout: Discord ne répond pas après 30s')), 30000);
        });
        
        await Promise.race([loginPromise, timeoutPromise]);
        console.log("✅ Discord Login OK");
        
    } catch (e) {
        console.error("❌ ERREUR:", e);
        console.error("❌ Stack:", e.stack);
        process.exit(1);
    }
})();







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
