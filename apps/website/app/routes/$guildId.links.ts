import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getGuildWithLinks } from '../models/guild';

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);

  const tags = url.searchParams.getAll('tags');

  const guild = await getGuildWithLinks({
    guildId: params.guildId as string,
    tags,
    linkCursorId: url.searchParams.get('linkCursorId')?.toString()
  });

  return json(guild);
};
