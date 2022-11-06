import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { auth } from '~/lib/auth.server';

export const loader: LoaderFunction = () => redirect('/');

export const action: ActionFunction = async ({ request }) => {
  return await auth.authenticate('discord', request, {
    successRedirect: '/dashboard'
  });
};
