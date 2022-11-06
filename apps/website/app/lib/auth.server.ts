import { Authenticator } from 'remix-auth';
import { DiscordStrategy } from 'remix-auth-discord';

import { sessionStorage } from '~/lib/session.server';
import type { User } from '~/models/user';
// import type { User } from "~/models/user.model";
// import { getUserByEmail } from "~/models/user.model";

export const auth = new Authenticator<User>(sessionStorage);

const discordStrategy = new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    callbackURL: `${process.env.BASE_URL}/auth/discord/callback`,
    // Provide all the scopes you want as an array
    scope: ['identify', 'email', 'guilds']
  },
  async ({ profile, accessToken }) => {
    // Get the user data from your DB or API using the tokens and profile
    return {
      profile: {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails ? profile.emails[0].value : ''
      },
      accessToken
    };
  }
);

auth.use(discordStrategy);
