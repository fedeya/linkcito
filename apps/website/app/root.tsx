import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react';
import styles from '~/styles/tailwind.css';
import Layout from './components/Layout';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Linkcito',
  viewport: 'width=device-width,initial-scale=1'
});

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    type: 'image/png',
    href: '/favicon.png'
  },
  {
    rel: 'stylesheet',
    href: styles
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com'
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    rel: 'stylesheet'
  }
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
