import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../typings';

const data = new SlashCommandBuilder();

const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute: async interaction => {
    await interaction.reply('pong!');
  }
};

export default pingCommand;
