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


// Event listeners pour debug
client.on('debug', info => {
    if (info.includes('gateway') || info.includes('heartbeat') || info.includes('Identify')) {
        console.log('🔍 DEBUG:', info);
    }
});

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
        
        // Timeout de 90 secondes (plus long pour Render)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('⏱️ Timeout: Discord ne répond pas après 90s')), 90000);
        });
        
        await Promise.race([loginPromise, timeoutPromise]);
        console.log("✅ Discord Login OK");
        
    } catch (e) {
        console.error("❌ ERREUR:", e.message);
        console.error("❌ Stack:", e.stack);
        process.exit(1);
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