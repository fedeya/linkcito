import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, Response } from '@remix-run/node';
import { prisma } from '~/db.server';
import {
  useLoaderData,
  Form,
  useSearchParams,
  useSubmit,
  useTransition,
  useCatch
} from '@remix-run/react';
import LinkItem from '~/components/LinkItem';
import { cn } from '~/lib/utils';

export const loader = async ({ params, request }: LoaderArgs) => {
  const url = new URL(request.url);

  const tags = url.searchParams.getAll('tag');

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

  return json(
    {
      guild
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate'
      }
    }
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data?.guild) {
    return {
      title: `${data.guild?.name} - Linkcito`
    };
  }

  return {};
};

export default function GuildPage() {
  const { guild } = useLoaderData<typeof loader>();
  const transition = useTransition();

  const submit = useSubmit();
  const [params] = useSearchParams();

  const tags =
    transition.state === 'submitting'
      ? transition.submission.formData.getAll('tag')
      : params.getAll('tag');

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
                    'bg-accent': tags.includes(tag.name)
                  }
                )}
                key={tag.id}
              >
                <span>#{tag.name}</span>
                <input
                  className="appearance-none"
                  type="checkbox"
                  name="tag"
                  value={tag.name}
                  defaultChecked={tags.includes(tag.name)}
                />
              </label>
            ))}
          </fieldset>
        </Form>

        <div className="w-full space-y-4 max-w-5xl mx-auto">
          {transition.state === 'idle' &&
            guild.links.map(link => (
              <LinkItem key={link.id} link={link as any} />
            ))}

          {transition.state === 'submitting' &&
            new Array(guild.links.length === 0 ? 5 : guild.links.length)
              .fill(1)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full rounded-md bg-secondary animate-pulse"
                />
              ))}
        </div>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-full">
        <h1 className="text-3xl text-white font-semibold">Guild not found</h1>

        <a
          className="bg-action w-fit px-8 py-3 rounded-md text-lg font-medium text-center text-white"
          href="https://discord.com/api/oauth2/authorize?client_id=1037163235901722705&permissions=277025392640&scope=bot"
        >
          Invite bot
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl mx-auto text-center pt-8 md:text-4xl text-white font-semibold">
        Oops, something went wrong
      </h1>
    </div>
  );
}
