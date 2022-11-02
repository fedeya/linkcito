import { Command } from '../typings';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLinkPreview } from 'link-preview-js';
import { PrismaClient } from '@linkcito/db';

const prisma = new PrismaClient();

function isURL(str: string) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
}

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

    console.log(interaction.user.id);

    const content = message[interaction.locale] || 'saved link!';

    const previewLink =
      link.includes('https') || link.includes('http')
        ? link
        : `https://${link}`;

    try {
      const preview = await getLinkPreview(previewLink, {
        followRedirects: 'manual',
        handleRedirects: (baseURL: string, forwardedURL: string) => {
          const urlObj = new URL(baseURL);
          const forwardedURLObj = new URL(forwardedURL);
          if (
            forwardedURLObj.hostname === urlObj.hostname ||
            forwardedURLObj.hostname === 'www.' + urlObj.hostname ||
            'www.' + forwardedURLObj.hostname === urlObj.hostname
          ) {
            return true;
          } else {
            return false;
          }
        }
      });

      const image =
        (preview as any).images &&
        Array.isArray((preview as any).images) &&
        (preview as any).images.length > 0
          ? (preview as any).images[0]
          : null;

      await prisma.link.create({
        data: {
          url: previewLink,
          guildId: interaction.guildId as string,
          tags,
          description: (preview as any).description,
          image,
          name: interaction.options.get('name')?.value as string,
          title: (preview as any).title,
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
          .setTitle((preview as any).title || null)
          .setDescription((preview as any).description || null)
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
    } catch (error) {
      console.log(error);
    }

    await interaction.reply({ content });
  }
};

export default SaveCommand;
