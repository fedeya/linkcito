import { Command } from '../typings';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '@linkcito/db';
import { getPreview, isURL } from '../utils';

const message: Record<string, string> = {
  es: 'link guardado!',
  'es-ES': 'link guardado!'
};

const SaveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('save')
    .setDescription('save link to database')
    .addStringOption(option =>
      option.setName('link').setDescription('link to save').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name').setDescription('optional custom name of link')
    )
    .addStringOption(option =>
      option.setName('tags').setDescription('tags separed by space')
    )
    .addBooleanOption(option =>
      option.setName('preview').setDescription('show link preview')
    ),

  execute: async interaction => {
    const link = interaction.options.get('link', true).value as string;

    if (!isURL(link)) {
      await interaction.reply({ content: 'invalid link', ephemeral: true });
      return;
    }

    const tags = (interaction.options.get('tags')?.value as string)?.split(' ');
    const showPreview = interaction.options.get('preview')?.value as boolean;

    const content = message[interaction.locale] || 'saved link!';

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

    await prisma.link.create({
      data: {
        url: previewLink,
        guildId: interaction.guildId as string,
        tags,
        description: preview.description,
        image,
        name: interaction.options.get('name')?.value as string,
        title: preview.title,
        author: {
          connectOrCreate: {
            where: {
              discordId: interaction.user.id
            },
            create: {
              discordId: interaction.user.id,
              name: interaction.user.username,
              image: interaction.user.avatarURL() as string
            }
          }
        }
      }
    });

    if (showPreview) {
      const embed = new EmbedBuilder()
        .setTitle(preview.title || null)
        .setDescription(preview.description || null)
        .setURL(previewLink)
        .setColor('Random')
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL() || undefined
        })
        .setImage(image);

      interaction.reply({ content, embeds: [embed] });
      return;
    }

    await interaction.reply({ content });
  }
};

export default SaveCommand;
