import type { ActionFunction } from '@remix-run/node';
import { auth } from '~/lib/auth.server';

export const action: ActionFunction = async ({ request }) => {
  return await auth.logout(request, { redirectTo: '/' });
};
