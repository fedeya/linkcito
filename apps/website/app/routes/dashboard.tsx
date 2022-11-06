import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { auth } from '~/lib/auth.server';
import { prisma } from '~/db.server';
import { useLoaderData } from '@remix-run/react';
import LinkItem from '~/components/LinkItem';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: '/'
  });

  const author = await prisma.author.findUnique({
    where: {
      discordId: user.id
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

  return json({
    author
  });
};

export default function Dashboard() {
  const { author } = useLoaderData<typeof loader>();

  return (
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
  );
}
