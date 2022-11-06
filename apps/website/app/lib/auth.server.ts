import { Authenticator } from 'remix-auth';
import type { DiscordProfile } from 'remix-auth-discord';
import { DiscordStrategy } from 'remix-auth-discord';

import { sessionStorage } from '~/lib/session.server';
// import type { User } from "~/models/user.model";
// import { getUserByEmail } from "~/models/user.model";

export const auth = new Authenticator<DiscordProfile>(sessionStorage);

const discordStrategy = new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    callbackURL: `${process.env.BASE_URL}/auth/discord/callback`,
    // Provide all the scopes you want as an array
    scope: ['identify', 'email', 'guilds']
  },
  async ({ profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return profile;
  }
);

auth.use(discordStrategy);
