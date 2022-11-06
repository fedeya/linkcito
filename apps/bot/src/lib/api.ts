import { prisma } from '@linkcito/db';

interface CreateLinkPayload {
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
  const { url, guild, title, description, name, image, user, icon } = payload;

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

  const link = await prisma.link.create({
    data: {
      url,
      guild: newGuild,
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

  return link.id;
};
