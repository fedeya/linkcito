import { prisma } from '@linkcito/db';

interface CreateLinkPayload {
  tags?: string[];
  url: string;
  icon?: string | null;
  title?: string;
  description?: string;
  guild: {
    id: string;
    name: string;
    image?: string | null;
  };
  image?: string | null;
  name?: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export const createLink = async (payload: CreateLinkPayload) => {
  const { url, guild, tags, title, description, name, image, user, icon } =
    payload;

  const newGuild = {
    connectOrCreate: {
      create: {
        id: guild.id,
        name: guild.name,
        image: guild.image || null
      },
      where: {
        id: guild.id
      }
    }
  };

  await prisma.link.create({
    data: {
      url,
      guild: newGuild,
      tags: {
        connectOrCreate: tags?.map(tag => ({
          create: {
            name: tag,
            guild: newGuild
          },
          where: {
            name_guildId: {
              guildId: guild.id,
              name: tag
            }
          }
        }))
      },
      icon: icon || null,
      description,
      image,
      name,
      title,
      author: {
        connectOrCreate: {
          where: {
            discordId: user.id
          },
          create: {
            discordId: user.id,
            name: user.name,
            image: user.image
          }
        }
      }
    }
  });
};
