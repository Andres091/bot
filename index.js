"use strict";

// Import AuthFile
const auth = require("./auth.json");

const config = {
    prefix: ";",
    queryParams: [
        ["How do I open the GUI menu?", // Question (Not used by code)
            [
                [
                    [" gui ", " menu "], " how ", " do ", " i ", " open "
                ],
                [" y ", " you ", " retard ", " faq ", "```", " monkey ", " javascript ", " install ", " get ", " download "]
            ], // first index is positives next is negatives
            2, // How much does not have to be in the query
            "To open the KAMI Blue Gui, you should press the `Y` key on your keyboard.\nTo find out more, please read: https://kamiblue.org/faq"
        ], // What does it respond when the message gets deleted

        ["Is KAMI Blue come out for 1.16?",
            [
                [
                    [" 115", " 116"],
                    [" update ", " port "],
                    [" when ", " will ", " is "],
                    [" out ", " for ", " there "],
                    [" kami ", "version"]
                ],
                [" vasya ", " you ", " retard ", " faq ", "```", " monkey ", " fabric ", " no ", " impossible "]
            ],
            1,
            "No, KAMI Blue will not be coming out for newer versions of Minecraft. It will stay on version `1.12.2` because it relies on version specific code. The developers, are instead working on a new client called Vasya.\nTo find out more, please read:https://kamiblue.org/faq\nVasya Website: https://vasya.dominikaaaa.org/"
        ],

        ["How do I install KAMI Blue?",
            [
                [" how ", " do ", " i ", " install " [" this ", " kami "]],
                [" you ", " retard ", " faq ", "```", " monkey ", " javascript ", " gui ", " menu ", " hacks "]
            ],
            0,
            "Download KAMI Blue from <#634549110145286156> or the website at https://kamiblue.org/download, then open the file. This should open an installer where you can choose which version you want.\nTo find out more, please read the <More Info> at:https://kamiblue.org/download"
        ]
    ],
    helpPages: [{
            "name": "Developer Commands",
            "emoji": "☕"
        },
        {
            "name": "Basic Commands",
            "emoji": "📜"
        },
        {
            "name": "FAQ Commands",
            "emoji": "<:kamiblue:637407885357482004>"
        },
        {
            "name": "Github Commands",
            "emoji": "<:jarfix:661737679351971840>"
        },
        {
            "name": "Moderation & Utility Commands",
            "emoji": "🔧"
        }
    ]
}

// Import Modules (for this file)
const Discord = require("discord.js");
const fs = require("graceful-fs");



// Client Definitions 
const client = new Discord.Client();
client.queue = new Map();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.colors = {
    kamiblue: "9b90ff" // mfw magenta
}
client.config = config;

client.on("ready", () => {
    console.log("Based.");
    const activities_list = ["you skid KAMI", ";help", "help in the #help-en channel"]; // add more then add the type of them below
    const activities_type = ["WATCHING", "LISTENING", "STREAMING"]; // types are PLAYING WATCHING LISTENING and STREAMING
    setInterval(() => {
        const activityIndex = Math.floor(Math.random() * activities_list.length);
        client.user.setPresence({
            activity: {
                name: activities_list[activityIndex],
                type: activities_type[activityIndex]
            }
        });

    }, 60000); // One minute
    client.channels.cache.get("699982782515904603").send("Bot has started up! !!!111");
});

fs.readdir("./commands/", (err, files) => {
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0)
        return console.log(" \"./commands\" has no commandFiles. Are they in the right directory?");
    jsfile.forEach((f, i) => {
        //it will log all the file names with extension .js
        let pull = require(`./commands/${f}`);
        console.log(`	- Searching ${f} \x1b[36m [Pending] \x1b[0m`); // Should be in colour
        if (pull.config) {
            client.commands.set(pull.config.name, pull);
            pull.config.aliases.forEach(alias => {
                client.aliases.set(alias, pull.config.name);
            });
            console.log(`	- Fetched command ${pull.config.name} from ${f} \x1b[32m [Resolved]\x1b[0m\n`);
        } else {
            console.log(`	- Does ${f} have no command? \x1b[31m[Rejected]\x1b[0m\n`)
        }
    });
    console.log("\n\n\x1b[1mCommands Loaded\x1b[22m\n\n")
});

client.on('message', async message => {
    if (message.author.bot) return; // Prevent Botcepttion Loop (Now Required)
    let prefix = config.prefix;
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);


    if (message.content.toLowerCase().indexOf("1 sec") >= 0) message.channel.send("It has been one second.");


    /*
         ___        _         ______          
       / _ \      | |        |  ___|         
      / /_\ \_   _| |_ ___   | |_ __ _  __ _ 
      |  _  | | | | __/ _ \  |  _/ _` |/ _` |
      | | | | |_| | || (_) | | || (_| | (_| |
      \_| |_/\__,_|\__\___/  \_| \__,_|\__, |
                                          | |
                                          |_|
     "Automatically answers silly questions"
    */



    function queryScanMessage(query, parameters, leeway = 2) {
        let ticker = 0;
        let looper = true;
        parameters[1].forEach(phrase => {
            if (query.indexOf(phrase) >= 0) return looper = !ticker;
        })
        if (looper) parameters[0].forEach(phrase => {
            if (phrase instanceof Array) {
                phrase.forEach(phrase => {
                    if (query.indexOf(phrase) >= 0) return ticker++;
                })
            } else if (query.indexOf(phrase) >= 0) ticker++;
        })
        if (ticker > parameters[0].length - leeway) return true; /*Actually its -2 but it starts at 0 so its -1*/
        return false;
    }

    let query = ` ${message.content.toLowerCase().replace(/[^a-zA-Z 0-9]+/g,"")} `;
    config["queryParams"].forEach(Params => {
        if (queryScanMessage(query, Params[1], Params[2]) && !message.content.startsWith(prefix) /*&& !!!message.member.roles.cache.map.length*/ ) return message.delete() && message.reply(Params[3]);
    })


    // Command Handler
    if (!message.content.startsWith(prefix)) return;
    let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)));
    if (commandfile) commandfile.run(client, message, args);
});

client.login(auth.token);
