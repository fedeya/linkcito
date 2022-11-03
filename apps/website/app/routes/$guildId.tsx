import type { LoaderArgs } from '@remix-run/node';
import { json, Response } from '@remix-run/node';
import { prisma } from '~/db.server';
import {
  useLoaderData,
  Form,
  useSearchParams,
  useSubmit
} from '@remix-run/react';
import clsx from 'clsx';
import {
  Button,
  Container,
  Card,
  Grid,
  Text,
  Row,
  Image,
  styled
} from '@nextui-org/react';
import LinkCard from '~/components/LinkCard';

export const loader = async ({ params, request }: LoaderArgs) => {
  const url = new URL(request.url);

  const tag = url.searchParams.get('tag');

  const guild = await prisma.guild.findUnique({
    where: { id: params.guildId },
    include: {
      tags: true,
      links: {
        where: {
          tags: {
            some: {
              name: tag?.toString() || undefined
            }
          }
        },
        take: 40,
        include: {
          tags: true
        }
      }
    }
  });

  if (!guild) throw new Response('Not found', { status: 404 });

  return json({
    guild
  });
};

const Box = styled('div');

export default function GuildPage() {
  const { guild } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const [params] = useSearchParams();

  const view = params.get('view') ?? 'cards';
  const tagParam = params.get('tag') ?? '';

  return (
    <Container fluid>
      <Text
        h1
        size={60}
        css={{
          textGradient: '45deg, $blue600 -20%, $pink600 50%',
          textAlign: 'center',
          mt: 20,
          mb: 30
        }}
        weight="bold"
      >
        #Linkcitos
      </Text>

      <div>
        <Form onChange={e => submit(e.currentTarget)}>
          {/* <fieldset className="flex gap-4 flex-wrap">
            {guild.tags.map(tag => (
              <label
                className={clsx(
                  'rounded-md cursor-pointer appearance-none shadow transition-all hover:opacity-80 ease-in font-medium px-4 py-2',
                  {
                    'bg-primary text-quaternary':
                      params.get('tag') === tag.name,
                    'bg-quaternary text-primary': params.get('tag') !== tag.name
                  }
                )}
                key={tag.id}
              >
                <span>#{tag.name}</span>

                <input
                  className="appearance-none"
                  name="tag"
                  type="radio"
                  checked={tagParam === tag.name}
                  value={tag.name}
                />
              </label>
            ))}
          </fieldset> */}

          <Box
            css={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              mb: 20,
              justifyContent: 'center'
            }}
          >
            {guild.tags.map(tag => (
              <Button
                type="submit"
                name="tag"
                value={tagParam === tag.name ? '' : tag.name}
                shadow
                color={tagParam === tag.name ? 'primary' : 'secondary'}
                flat
                auto
                key={tag.id}
              >
                #{tag.name}
              </Button>
            ))}
          </Box>
          {/* 
            <select defaultValue={view} name="view">
              <option value="cards">Cards View</option>
              <option value="list">List View</option>
            </select> */}
        </Form>

        {view === 'list' && (
          <div className="mt-4">
            {guild.links.map(link => (
              <div key={link.id} className="flex gap-2">
                <p className="text-primary">{link.name ?? link.title}</p>

                <a
                  href={link.url}
                  className="underline text-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.url}
                </a>

                <div className="flex gap-2">
                  {link.tags.map(tag => (
                    <span key={tag.id} className="text-secondary">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'cards' && (
          <Grid.Container gap={4} justify="center">
            {guild.links.map(link => (
              <LinkCard key={link.id} link={link as any} />
            ))}
          </Grid.Container>
        )}
      </div>
    </Container>
  );
}
