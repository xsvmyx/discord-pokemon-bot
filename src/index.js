const {Client , IntentsBitField } = require('discord.js');
require('dotenv').config();
const mongoose = require('mongoose');

const { guess } = require('./commands/guess-name');
const {setLang} = require('./commands/lang')
const {guess_gen} = require('./commands/guess-gen');
const {guess_types} = require("./commands/guess-types");

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







client.on('ready', (c) => {
    console.log(`############# ${c.user.tag} is online`);
});
                

client.on("messageCreate", msg => {
  if(msg.author.bot) return;

  console.log(msg.content);
    
    if(msg.content === "shbob")
        msg.react("😀");
        

   
});




client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {

        case 'guess':
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



