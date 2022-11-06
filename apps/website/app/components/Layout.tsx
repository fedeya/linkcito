import { Link } from '@remix-run/react';
import type { FC, ReactElement } from 'react';
import { HiHeart } from 'react-icons/hi';

const Layout: FC<{ children: ReactElement }> = ({ children }) => {
  return (
    <div className="font-sans">
      <header className="bg-primary h-16">
        <nav className="w-full max-w-7xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="text-white text-lg flex-1 justify-start">
            <span className="text-xs text-slate-500">https://</span>
            <span className="font-bold">Linkcito</span>
            <span className="text-xs text-slate-500">.com</span>
          </Link>

          <div>
            <button className="bg-action shadow-md flex-1 justify-end hover:opacity-70 rounded-md px-4 py-2 font-medium text-white">
              Login
            </button>
          </div>
        </nav>
      </header>

      <main className="min-h-[calc(100vh-80px-64px)] bg-primary text-gray">
        {children}
      </main>

      <footer className="text-center py-4 flex justify-center h-[80px] bg-secondary text-gray">
        <p className="flex items-center gap-1">
          Made with <HiHeart className="text-red-500" />
          by{' '}
          <a
            href="https://github.com/Fedeya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white"
          >
            Fedeya
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Layout;
