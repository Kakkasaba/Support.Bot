const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, version } = require('discord.js');
const { token } = require('./config.json');
const config = require('./config.json');
const allowedUserIds = ['995991004366778458', '843163055101444117'];
const os = require('os');
const startTime = new Date();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on('ready', () => {
	setInterval(() => {
	  client.user.setPresence({
		activities: [{name: `${client.guilds.cache.size}s|${client.ws.ping}ms`}], status: 'online',
		activities: [{name: `test`}], status: 'online'
	  })
	}, 5000)
  })

  client.once(Events.ClientReady, () => {
	const server = client.guilds.cache.get(config.serverId);
	const channel = server.channels.cache.get(config.channelId);
	channel.send(`ready`);
});

 client.once(Events.ClientReady, () => {
	const server = client.guilds.cache.get(config.serverId);
	const channel = server.channels.cache.get(config.channelId);
	console.log(`ready`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on('messageCreate', message => {
	if (!allowedUserIds.includes(message.author.id)) return;
	if (message.author.bot) return;
	if (message.content === "s!system") {
		message.reply(`> tag: ${client.user.tag}\n> id: ${client.user.id}\n> ping: ${client.ws.ping} ms\n> os: ${os.version()}(${os.type()})${os.arch()}\n> starttime: ${startTime}\n> environment: Visual Studio Code\n> language: JavaScript\n> discord.js: ${version}\n> error: 表示できません\n> server: ${client.guilds.cache.size}\n> developer: [@kakkakun](<https://discord.com/users/843163055101444117>)`)
	}
});

// 定期的にメモリ使用量を吐き出す
setInterval(() => {
	const used = process.memoryUsage()
	const messages = []
	for (let key in used) {
	  messages.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
	}
	console.log(new Date(), messages.join(', '))
  }, 6 * 2 * 1000)
  


  
  client.on('messageCreate', async message => {
    if (message.channel.name === 'グローバル') {
      if (message.author.bot) return;
      if (!message.attachments.size) await message.react("✅");
      const author = { name: message.author.tag, iconURL: message.author.displayAvatarURL() };
      const footer = { text: message.guild.name, iconURL: message.guild.iconURL() };
      for (const channel of client.channels.cache.values()) {
        if (channel.topic !== 'グローバル') continue;
        if (message.content) {
          const embed = new Discord.EmbedBuilder()
            .setAuthor(author)
            .setDescription(message.content)
            .setColor('#7fbfff')
            .setFooter(footer)
            .setTimestamp();
          await channel.send({ embeds: [embed] });
        }
        for (const attachment of message.attachments.values()) {
          const embed = new Discord.EmbedBuilder	()
            .setAuthor(author)
            .setImage(attachment.url)
            .setDescription(attachment.url)
            .setColor('#7fbfff')
            .setFooter(footer)
            .setTimestamp();
          await channel.send({ embeds: [embed] });
        }
      }
    }
  });

client.login(token);
