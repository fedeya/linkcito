import type { User } from './user';
import { cache } from '~/lib/cache.server';
import { prisma } from '~/db.server';

export interface UserGuild {
  name: string;
  id: string;
  icon: string;
  owner: boolean;
  permissions: number;
}

async function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getBotGuilds(): Promise<UserGuild[]> {
  const guilds = await cache.get<UserGuild[]>('bot-guilds');

  if (guilds) return guilds;

  const res = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`
    }
  });

  if (!res.ok) {
    const { retry_after } = await res.json();

    if (retry_after) {
      await timeout(retry_after);

      return getBotGuilds();
    }
  }

  const data = await res.json();

  await cache.set('bot-guilds', data, 120);

  return data;
}

export async function getUserGuilds(user: User): Promise<UserGuild[]> {
  const guilds = await cache.get<UserGuild[]>(`user-guilds-${user.profile.id}`);

  if (guilds && Array.isArray(guilds)) return guilds;

  const res = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${user.accessToken}`
    }
  });

  if (!res.ok) {
    const { retry_after } = await res.json();

    if (retry_after) {
      await timeout(retry_after);

      return getUserGuilds(user);
    }
  }

  const data = await res.json();

  await cache.set(`user-guilds-${user.profile.id}`, data, 120);

  return data;
}

export async function getMutualGuilds(user: User) {
  const [userGuilds, botGuilds] = await Promise.all([
    getUserGuilds(user),
    getBotGuilds()
  ]);

  return userGuilds.filter(
    guild =>
      ((guild.permissions & 0x08) === 0x08 || guild.owner) &&
      botGuilds.some(botGuild => botGuild.id === guild.id)
  );
}

export async function getGuildRoles(
  id: string,
  accessToken: string
): Promise<string[]> {
  const res = await fetch(`https://discord.com/api/guilds/${id}/roles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const { retry_after, ...rest } = await res.json();

    if (retry_after) {
      await timeout(retry_after);

      return getGuildRoles(id, accessToken);
    }

    throw new Error(JSON.stringify(rest));
  }

  return res.json();
}

export type GetGuildWithLinksParams = {
  guildId: string;
  linkCursorId?: string;
  tags: string[];
};

export const getGuildWithLinks = async (params: GetGuildWithLinksParams) => {
  const { guildId, tags, linkCursorId } = params;

  const key = `guild-${guildId}-${linkCursorId}-${tags.join('-')}`;

  const cached = await cache.get(key);

  if (cached) {
    console.log(cached);
    return cached as never;
  }

  const take = 40;

  const where =
    tags && tags.length > 0
      ? {
          tags: {
            some: {
              name: {
                in: tags
              }
            }
          }
        }
      : undefined;

  const cursor = linkCursorId ? { id: linkCursorId } : undefined;

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      tags: true,
      links: {
        take,
        cursor,
        skip: cursor ? 1 : 0,
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          tags: true,
          author: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  });

  await cache.set(key, guild, 60);

  return guild;
};
