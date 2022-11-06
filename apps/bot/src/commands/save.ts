import type { Command, CommandInteraction } from '../typings';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  SelectMenuBuilder
} from 'discord.js';
import { getPreview, isURL } from '../utils';
import { createLink } from '../lib/api';
import { prisma } from '@linkcito/db';

export default class SaveCommand implements Command {
  data = new SlashCommandBuilder()
    .setName('save')
    .setDescription('save link to database')
    .addStringOption(option =>
      option.setName('link').setDescription('link to save').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name').setDescription('optional custom name of link')
    )
    .addBooleanOption(option =>
      option.setName('preview').setDescription('show link preview')
    );

  async execute(interaction: CommandInteraction) {
    const link = interaction.options.get('link', true).value as string;

    if (!isURL(link)) {
      await interaction.reply({ content: 'invalid link', ephemeral: true });
      return;
    }

    // const tags = (interaction.options.get('tags')?.value as string)?.split(' ');
    const showPreview = interaction.options.get('preview')?.value as boolean;

    const content = 'saved link!';

    const previewLink =
      link.includes('https') || link.includes('http')
        ? link
        : `https://${link}`;

    const preview = await getPreview(previewLink);

    await interaction.deferReply({ ephemeral: true });

    const image =
      preview.images &&
      Array.isArray(preview.images) &&
      preview.images.length > 0
        ? preview.images[0]
        : null;

    const guildId = interaction.guildId as string;

    const id = await createLink({
      guild: {
        id: guildId,
        name: interaction.guild?.name || '',
        image: interaction.guild?.iconURL()
      },
      url: previewLink,
      icon:
        preview.favicons &&
        Array.isArray(preview.favicons) &&
        preview.favicons.length > 0
          ? preview.favicons[0]
          : null,
      user: {
        id: interaction.user.id,
        image:
          interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        name: interaction.user.username + '#' + interaction.user.discriminator
      },
      description: preview.description,
      image,
      name: interaction.options.get('name')?.value as string,
      title: preview.title
    });

    const tags = await prisma.tag.findMany({ where: { guildId } });

    let components: any[] = [];

    if (tags.length !== 0) {
      console.log(tags);

      const select = new SelectMenuBuilder()
        .setCustomId(id)
        .setMinValues(1)
        .setPlaceholder('Select tags')
        .addOptions(
          tags.map(tag => ({
            label: tag.name,
            value: tag.id
          }))
        );

      const row = new ActionRowBuilder().addComponents(select);

      components.push(row);
    }

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

      await interaction.editReply({
        content,
        embeds: [embed],
        components
      });
      return;
    }

    await interaction.editReply({
      content,
      components
    });
  }
}
