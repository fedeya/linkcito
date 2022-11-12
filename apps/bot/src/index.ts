import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Collection,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from 'discord.js';
import { Client as IClient, Command } from './typings';
import path from 'node:path';
import { config } from 'dotenv';
import glob from 'glob';
import { prisma } from '@linkcito/db';
import { isURL, getPreview } from './utils';
import { createLink } from './lib/api';

config({
  path: path.join(__dirname, '..', '..', '..', '.env')
});

const client: IClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

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

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.split(' ');

  const link = args.find(text => isURL(text));

  if (link) {
    const saveButton = new ButtonBuilder()
      .setCustomId('save')
      .setLabel('Save')
      .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(cancelButton)
      .addComponents(saveButton);

    await message.reply({
      content: 'you want to save this link? `' + link + '`',
      components: [row as any]
    });
  }
});

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

  if (interaction.isButton()) {
    if (interaction.customId === 'cancel') {
      await interaction.message.delete();

      await interaction.deferReply();

      await interaction.deleteReply();

      return;
    }

    try {
      if (interaction.customId === 'save') {
        const link = interaction.message.content.split('`')[1];

        await interaction.message.delete();

        await interaction.deferReply({ ephemeral: true });

        const previewLink =
          link.includes('https') || link.includes('http')
            ? link
            : `https://${link}`;

        const preview = await getPreview(previewLink);

        const image =
          preview.images &&
          Array.isArray(preview.images) &&
          preview.images.length > 0
            ? preview.images[0]
            : null;

        await createLink({
          title: preview.title,
          description: preview.description,
          icon:
            preview.favicons &&
            Array.isArray(preview.favicons) &&
            preview.favicons.length > 0
              ? preview.favicons[0]
              : null,
          image: image,
          url: preview.url,
          user: {
            id: interaction.user.id,
            name:
              interaction.user.username + '#' + interaction.user.discriminator,
            image: interaction.user.avatarURL() || null
          },
          guild: {
            id: interaction.guildId as string,
            name: interaction.guild?.name!,
            image: interaction.guild?.iconURL() || null
          }
        });

        await interaction.editReply({
          content: 'Link saved!'
        });
      }
    } catch (err) {
      await interaction.editReply({
        content: 'There was an error while saving this link!'
      });
      return;
    }
  }

  if (interaction.isSelectMenu()) {
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
