const {Client , IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const { Events } = require('discord.js');
const http = require("http");
const https = require("https");

// 🔧 CRITICAL: Force keepAlive pour Render
http.globalAgent.keepAlive = true;
https.globalAgent.keepAlive = true;
https.globalAgent.keepAliveMsecs = 30000;
https.globalAgent.maxSockets = 50;

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
    ],
    ws: {
        large_threshold: 50,
        compress: true,
    },
    rest: {
        timeout: 60000,
        retries: 5
    }
});


client.once(Events.ClientReady, (c) => {
    console.log(`############# ${c.user.tag} is online`);
});

client.on("messageCreate", msg => {
    if(msg.author.bot) return;
    
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


// Event listeners - TOUS les logs activés
client.on('debug', info => {
    console.log('🔍 DEBUG:', info);
});

client.on('warn', warning => {
    console.log('⚠️ WARN:', warning);
});

client.on('error', error => {
    console.error('❌ ERROR:', error);
});

client.on('ready', () => {
    console.log('✅✅✅ CLIENT READY EVENT FIRED ✅✅✅');
});

client.on('invalidated', () => {
    console.log('❌ Session invalidated - will retry');
});

client.on('shardError', error => {
    console.error('❌ Shard error:', error);
});

client.on('shardDisconnect', (event, id) => {
    console.log('🔌 Shard disconnected:', id, event);
});

client.on('shardReconnecting', id => {
    console.log('🔄 Shard reconnecting:', id);
});

client.on('shardReady', (id) => {
    console.log(`✅ Shard ${id} ready`);
});

client.on('shardResume', (id, replayedEvents) => {
    console.log(`🔄 Shard ${id} resumed, replayed ${replayedEvents} events`);
});


(async () => {
    try {
        console.log("🔍 TOKEN présent?", !!process.env.TOKEN);
        console.log("🔍 TOKEN length:", process.env.TOKEN?.length);
        console.log("🔍 DB_URI présent?", !!process.env.DB_URI);
        
        await mongoose.connect(process.env.DB_URI);
        console.log("✅ DB OK");
        
        console.log("🔄 Connexion Discord (sans timeout - laisse Discord.js gérer)...");
        
        // PLUS DE TIMEOUT - Discord.js gère ses propres retries
        client.login(process.env.TOKEN)
            .then(() => console.log("✅✅✅ LOGIN PROMISE RESOLVED ✅✅✅"))
            .catch(err => {
                console.error("❌ Login failed:", err);
                console.error("❌ Error code:", err.code);
                console.error("❌ Error message:", err.message);
                
                // Retry après 15 secondes
                console.log("🔄 Will retry in 15 seconds...");
                setTimeout(() => {
                    console.log("🔄 Retrying login...");
                    client.login(process.env.TOKEN);
                }, 15000);
            });
        
    } catch (e) {
        console.error("❌ ERREUR SETUP:", e);
        console.error("❌ Stack:", e.stack);
    }
})();


// 🔧 Render keep-alive 
const server = http.createServer((req, res) => {
    const work = Math.sqrt(Math.random() * Date.now());
    console.log(`[PING] work=${work}`);
    
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running");
});

server.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Dummy HTTP server running on port", process.env.PORT || 3000);
});