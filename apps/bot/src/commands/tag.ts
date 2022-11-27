import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command, CommandInteraction } from '../typings';
import { prisma } from '@linkcito/db';

export default class TagCommand implements Command {
  data = new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Tag commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a tag')
        .addStringOption(option =>
          option.setName('name').setDescription('Tag name').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a tag')
        .addStringOption(option =>
          option.setName('name').setDescription('Tag name').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('list').setDescription('List all tags')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const tags = await prisma.tag.findMany({
        where: {
          guildId: interaction.guildId!
        },
        select: {
          name: true
        }
      });
      const tagNames = tags.map(tag => '`' + tag.name + '`').join(', ');

      await interaction.reply(`Tags: ${tagNames}`);
    }

    if (subcommand === 'create') {
      const name = interaction.options.getString('name', true);

      await interaction.deferReply();

      try {
        await prisma.tag.create({
          data: {
            name,
            guild: {
              connectOrCreate: {
                create: {
                  id: interaction.guildId!,
                  name: interaction.guild?.name!,
                  image: interaction.guild?.iconURL() || null
                },
                where: {
                  id: interaction.guildId!
                }
              }
            }
          }
        });

        await interaction.editReply(`created tag \`${name}\` successfully`);
      } catch (err) {
        await interaction.editReply(`failed to create tag ${name}`);
      }
    }

    if (subcommand === 'delete') {
      await interaction.deferReply();
      const name = interaction.options.getString('name', true);

      try {
        await prisma.tag.delete({
          where: {
            name_guildId: {
              name,
              guildId: interaction.guildId!
            }
          }
        });

        await interaction.editReply(`deleted tag \`${name}\` successfully`);
      } catch (err) {
        await interaction.editReply(`failed to delete tag ${name}`);
      }
    }
  }
}
