import { Command, CommandInteraction } from '../typings';
import {
  ButtonBuilder,
  SlashCommandBuilder,
  ButtonStyle,
  ActionRowBuilder
} from 'discord.js';

export default class BoardCommand implements Command {
  data = new SlashCommandBuilder()
    .setName('board')
    .setDescription('show board');

  async execute(interaction: CommandInteraction) {
    const url = `${process.env.BASE_URL}/${interaction.guildId}`;

    const button = new ButtonBuilder()
      .setURL(url)
      .setLabel('Go to your board')
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    interaction.reply({ content: 'Here you go!', components: [row as any] });
  }
}
