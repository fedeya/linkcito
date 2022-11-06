import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { auth } from '~/lib/auth.server';
import { prisma } from '~/db.server';
import { useLoaderData } from '@remix-run/react';
import LinkItem from '~/components/LinkItem';
import { getUserGuilds } from '~/models/guild';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: '/'
  });

  const author = await prisma.author.findUnique({
    where: {
      discordId: user.profile.id
    },
    include: {
      links: {
        include: {
          guild: {
            select: {
              name: true,
              image: true
            }
          },
          tags: {
            select: {
              name: true,
              id: true
            }
          }
        }
      }
    }
  });

  const guilds = await getUserGuilds(user);

  console.log(guilds);

  return json({
    author,
    guilds
  });
};

export default function Dashboard() {
  const { author } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        <h1 className="text-center text-3xl font-bold text-white mb-4">
          My Links
        </h1>

        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {author?.links.map(link => (
            <LinkItem
              key={link.id}
              link={{ ...link, author: link.guild } as any}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
