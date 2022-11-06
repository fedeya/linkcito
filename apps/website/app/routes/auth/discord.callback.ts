import type { LoaderFunction } from '@remix-run/node';
import { auth } from '~/lib/auth.server';

export let loader: LoaderFunction = async ({ request, context }) => {
  console.log('callback');

  return await auth.authenticate('discord', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    context
  });
};
