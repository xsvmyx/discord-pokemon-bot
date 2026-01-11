const { REST, Routes ,ApplicationCommandOptionType} = require('discord.js');
require('dotenv').config();

// this file is to register new commands 

const commands = [
    {
        name:'guess-types',
        description:"guess a Pokémon's type(s)"
    },
    {
        name:'guess-gen',
        description:"guess a Pokémon's generation",

    },
    {
    name: 'lang',
    description: "Set your preferred language for Pokémon names",
    options: [
        {
            name: "language",
            description: "Choose your language",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "English", value: "en" },
                { name: "French", value: "fr" },
                { name: "German", value: "de" },
                { name: "Spanish", value: "es" },
                { name: "Italian", value: "it" },
                { name: "Japanese (Hiragana/Katakana)", value: "ja-Hrkt" },
                { name: "Japanese (Kanji)", value: "ja" },
                { name: "Romaji", value: "roomaji" },
                { name: "Korean", value: "ko" },
                { name: "Chinese (Traditional)", value: "zh-Hant" },
                { name: "Chinese (Simplified)", value: "zh-Hans" }
            ]
        }
    ]
},

    
    {
        name: 'guess',
        description: "guessing a Pokémon's name in a given generation (no gen = among all gens)",
        options: [
            {
                name: "gen",
                description: "the generation",
                type: ApplicationCommandOptionType.Number,
                choices : [
                                {
                                    name : 'gen1',
                                    value: 1,
                                },
                                {
                                    name : 'gen2',
                                    value: 2,
                                },
                                {
                                    name : 'gen3',
                                    value: 3,
                                },
                                {
                                    name : 'gen4',
                                    value: 4,
                                },
                                {
                                    name : 'gen5',
                                    value: 5,
                                },
                                {
                                    name : 'gen6',
                                    value: 6,
                                },
                                {
                                    name : 'gen7',
                                    value: 7,
                                },
                                {
                                    name : 'gen8',
                                    value: 8,
                                },
                                {
                                    name : 'gen9',
                                    value: 9,
                                },
                        ],
            }
        ]
    },
    

];

//envoyer les commandes a l'api de discord
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


(async () => {
    try {
        console.log("...registering commands...");

        await rest.put(
            //Routes.applicationCommands(process.env.CLIENT_ID),
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_OPM),

            { body: commands }
        );

//         await rest.put(
//   Routes.applicationCommands(process.env.CLIENT_ID),
//   { body: [] }
// );


        console.log("!!commands registered!!");
    } catch (e) {
        console.log(`error hbb : ${e}`);
    }
})();
