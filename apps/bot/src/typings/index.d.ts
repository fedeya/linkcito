import type {
  CommandInteraction as DiscordCommandInteraction,
  Collection,
  Client as DiscordClient
} from 'discord.js';

export interface Client extends DiscordClient {
  commands?: Collection<string, Command>;
}

export interface CommandInteraction extends DiscordCommandInteraction {
  client: Client;
}

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}
