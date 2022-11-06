import type { LoaderArgs } from '@remix-run/node';
import { json, Response } from '@remix-run/node';
import { prisma } from '~/db.server';
import {
  useLoaderData,
  Form,
  useSearchParams,
  useSubmit
} from '@remix-run/react';
import LinkItem from '~/components/LinkItem';
import { cn } from '~/lib/utils';

export const loader = async ({ params, request }: LoaderArgs) => {
  const url = new URL(request.url);

  const tag = url.searchParams.get('tag');

  const where = tag
    ? {
        tags: {
          some: {
            name: tag.toString() || undefined
          }
        }
      }
    : undefined;

  const guild = await prisma.guild.findUnique({
    where: { id: params.guildId },
    include: {
      tags: true,
      links: {
        take: 40,
        where,
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

  if (!guild) throw new Response('Not found', { status: 404 });

  return json({
    guild
  });
};

export default function GuildPage() {
  const { guild } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const [params] = useSearchParams();

  const tagParam = params.get('tag') ?? '';

  return (
    <div>
      <div className="py-4 px-2">
        <div className="flex items-center mb-4 gap-4 justify-center">
          {guild.image && (
            <img
              src={guild.image}
              alt={guild.name}
              className="h-16 w-16 rounded-lg shadow-md object-cover"
            />
          )}
          <h1 className="text-3xl md:text-4xl text-white font-semibold">
            {guild.name}
          </h1>
        </div>

        <Form className="mb-4" onChange={e => submit(e.currentTarget)}>
          <fieldset className="flex items-center gap-4 justify-center">
            {guild.tags.map(tag => (
              <label
                className={cn(
                  'rounded-md cursor-pointer shadow hover:opacity-70 px-4 py-2 bg-[#141432] text-gray',
                  {
                    'bg-accent': tagParam === tag.name
                  }
                )}
                key={tag.id}
              >
                <span>#{tag.name}</span>
                <input
                  className="appearance-none"
                  type="radio"
                  name="tag"
                  value={tagParam === tag.name ? '' : tag.name}
                  defaultChecked={tagParam === tag.name}
                />
              </label>
            ))}
          </fieldset>
        </Form>

        <div className="w-full space-y-4 max-w-5xl mx-auto">
          {guild.links.map(link => (
            <LinkItem key={link.id} link={link as any} />
          ))}
        </div>
      </div>
    </div>
  );
}
