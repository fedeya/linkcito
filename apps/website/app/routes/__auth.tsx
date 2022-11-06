import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';
import Button from '~/components/Button';
import { auth } from '~/lib/auth.server';
import { getMutualGuilds } from '~/models/guild';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: '/'
  });

  const guilds = await getMutualGuilds(user);

  return json(
    {
      user,
      guilds
    },
    {
      headers: {
        'Cache-Control':
          'private, max-age=60, s-maxage=0, stale-while-revalidate'
      }
    }
  );
};

export const meta: MetaFunction = () => ({
  title: 'Dashboard - Linkcito'
});

export default function AuthLayout() {
  const { guilds } = useLoaderData<typeof loader>();

  return (
    <div className="max-h-screen h-screen w-full bg-primary text-gray">
      <aside className="max-h-screen flex flex-col gap-2 md:gap-4 overflow-auto w-24 md:w-32 fixed h-full py-10 px-4 items-center md:px-6 bg-secondary">
        {guilds.map(guild => (
          <Link to={`/${guild.id}/settings`} key={guild.id}>
            {guild.icon ? (
              <img
                className="rounded-md h-12 w-12 md:h-16 md:w-16 object-cover shadow-md"
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
              />
            ) : (
              <div className="w-12 h-12 md:h-16 md:w-16 rounded-md shadow-md flex items-center bg-primary-600 justify-center">
                <p className="text-lg font-medium">{guild.name[0]}</p>
              </div>
            )}
          </Link>
        ))}
      </aside>

      <div className="max-h-screen py-4 w-full pl-28 md:pl-36 pr-4 overflow-auto">
        <header className="h-16">
          <nav className="flex justify-between max-w-6xl mx-auto items-center">
            <Link
              to="/my-links"
              className="text-white text-lg flex-1 justify-start"
            >
              <span className="text-xs text-slate-500">https://</span>
              <span className="font-bold">Linkcito</span>
              <span className="text-xs text-slate-500">.com</span>
            </Link>

            <Form method="post" action="/auth/logout">
              <Button>Log out</Button>
            </Form>
          </nav>
        </header>

        <main>
          <Outlet />
        </main>

        <footer></footer>
      </div>
    </div>
  );
}
