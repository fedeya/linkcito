import { prisma } from '@linkcito/db';

interface CreateLinkPayload {
  tags?: string[];
  url: string;
  title?: string;
  description?: string;
  guildId: string;
  image?: string | null;
  name?: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export const createLink = async (payload: CreateLinkPayload) => {
  const { url, guildId, tags, title, description, name, image, user } = payload;

  const guild = {
    connectOrCreate: {
      create: {
        id: guildId
      },
      where: {
        id: guildId
      }
    }
  };

  await prisma.link.create({
    data: {
      url,
      guild,
      tags: {
        connectOrCreate: tags?.map(tag => ({
          create: {
            name: tag,
            guild
          },
          where: {
            name_guildId: {
              guildId,
              name: tag
            }
          }
        }))
      },
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
