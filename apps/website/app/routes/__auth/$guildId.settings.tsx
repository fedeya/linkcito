import type { ActionFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useCatch, useLoaderData, useTransition } from '@remix-run/react';
import { auth } from '~/lib/auth.server';
import invariant from 'tiny-invariant';
import { prisma } from '~/db.server';
import { useEffect, useRef } from 'react';
import { HiExternalLink, HiTrash, HiUserRemove } from 'react-icons/hi';
import { getMutualGuilds } from '~/models/guild';
import Button from '~/components/Button';
import TagSetting from '~/components/TagSetting';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(typeof params.guildId === 'string', 'invalid params');

  const user = await auth.isAuthenticated(request, {
    failureRedirect: '/'
  });

  const userGuilds = await getMutualGuilds(user);

  if (!userGuilds.some(guild => guild.id === params.guildId)) {
    throw new Response('Not found', { status: 404 });
  }

  const guild = await prisma.guild.findUnique({
    where: {
      id: params.guildId
    },
    include: {
      _count: true,
      tags: true
    }
  });

  if (!guild) throw new Response('Not found', { status: 404 });

  return json({
    guild
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data?.guild) {
    return {
      title: `${data.guild?.name} Settings - Linkcito`
    };
  }

  return {};
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.guildId, 'Invalid params');

  const formData = Object.fromEntries(await request.formData());

  const { action } = formData;

  if (action === 'add') {
    const { name } = formData;

    invariant(name, 'name required');

    await prisma.tag.create({
      data: {
        name: name.toString(),
        guildId: params.guildId
      }
    });

    return json({ ok: true });
  }

  if (action === 'remove') {
    const { id, deleteLinks } = formData;

    invariant(id, 'id required');

    const promises: Promise<any>[] = [];

    if (deleteLinks === 'on') {
      promises.push(
        prisma.link.deleteMany({
          where: {
            tags: {
              some: {
                id: id.toString()
              }
            }
          }
        })
      );
    }

    promises.push(
      prisma.tag.delete({
        where: {
          id: id.toString()
        }
      })
    );

    await Promise.all(promises);

    return json({ ok: true });
  }

  return json({});
};

export default function GuildSettings() {
  const { guild } = useLoaderData<typeof loader>();
  const transition = useTransition();

  const isAdding =
    transition.state === 'submitting' &&
    transition.submission.formData.get('action') === 'add';

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="bg-secondary justify-between w-full flex items-center gap-2 p-4 rounded-md">
          <div className="flex items-center gap-2">
            {guild?.image && (
              <img
                className="w-6 h-6 rounded-md"
                src={guild?.image}
                alt={guild?.name}
              />
            )}
            {guild?.name}
          </div>

          <div>
            <a
              href={`/${guild?.id}`}
              target="_blank"
              className="text-action flex items-center gap-1"
              rel="noopenner noreferrer"
            >
              Open <HiExternalLink />
            </a>
          </div>
        </div>
        <div className="flex gap-4 items-center w-full">
          <div className="bg-secondary w-full p-4 rounded-md">
            <span className="font-bold">{guild?._count.links}</span> Links
          </div>

          <div className="bg-secondary w-full p-4 rounded-md">
            <span className="font-bold">{guild?._count.tags}</span> Tags
          </div>
        </div>
      </div>

      <div className="bg-secondary mt-4 rounded-md p-4 w-full">
        <p className="text-xl font-medium mb-4">Tags</p>

        <div className="flex gap-4 flex-wrap">
          {guild?.tags.map(tag => (
            <TagSetting key={tag.id} name={tag.name} id={tag.id} />
          ))}
        </div>

        <Form
          ref={formRef}
          method="post"
          className="mt-10 md:w-fit flex-col justify-center md:flex-row w-full flex items-end gap-2"
        >
          <label className="flex flex-col w-full md:w-fit gap-2">
            <span>Name</span>
            <input
              ref={inputRef}
              type="text"
              required
              name="name"
              placeholder="Tag name"
              className="bg-primary-600 outline-none focus:ring-1 ring-action rounded-md px-4 py-2"
            />
          </label>

          <Button
            type="submit"
            name="action"
            value="add"
            className="md:w-fit w-full"
          >
            Add
          </Button>
        </Form>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-xl font-medium mb-8">Guild not found</p>
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
    <div className="max-w-6xl mx-auto">
      <p className="text-xl font-medium">Something went wrong</p>
    </div>
  );
}
