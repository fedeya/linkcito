import { SlashCommandBuilder } from 'discord.js';
import type { Command, CommandInteraction } from '../typings';

export default class PingCommand implements Command {
  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

  async execute(interaction: CommandInteraction) {
    await interaction.reply('pong!');
  }
}
