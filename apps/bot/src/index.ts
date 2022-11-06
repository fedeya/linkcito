import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Collection
} from 'discord.js';
import { Client as IClient, Command } from './typings';
import path from 'node:path';
import { config } from 'dotenv';
import glob from 'glob';
import { prisma } from '@linkcito/db';

config({
  path: path.join(__dirname, '..', '..', '..', '.env')
});

const client: IClient = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commands: any[] = [];

glob.sync(path.join(__dirname, '/commands/**/*.{js,ts}')).forEach(filePath => {
  const CommandClass = require(filePath);

  const command: Command = new CommandClass.default();

  if ('data' in command && 'execute' in command) {
    client.commands?.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
});

const TOKEN = process.env.DISCORD_TOKEN as string;

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing application (${commands.length}) commands.`
    );

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string),
      {
        body: commands
      }
    );

    console.log(
      `Successfully reloaded application (${commands.length}) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

client.on('guildCreate', async guild => {
  console.log('Created guild', guild.name, guild.id);

  await prisma.guild.create({
    data: {
      id: guild.id,
      name: guild.name,
      image: guild.iconURL() || null
    }
  });
});

client.on('ready', () => {
  console.log('Successfully logged as', client.user?.tag);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const client = interaction.client as IClient;

    const command = client.commands?.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    }
  }

  if (interaction.isSelectMenu()) {
    console.log(interaction.customId, interaction.values);

    const linkId = interaction.customId;

    await prisma.link.update({
      where: {
        id: linkId
      },
      data: {
        tags: {
          connect: interaction.values.map(value => ({
            id: value
          }))
        }
      }
    });

    await interaction.reply({
      content: 'Tags saved!',
      ephemeral: true
    });
  }
});

client.login(TOKEN);
