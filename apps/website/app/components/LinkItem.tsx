import type { Author, Link, Tag } from '@linkcito/db';
import type { FC } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import * as Tooltip from '@radix-ui/react-tooltip';

type LinkItemProps = {
  link: Partial<Link> & {
    tags: Partial<Tag>[];
    author: Pick<Author, 'name' | 'image'>;
  };
};

const LinkItem: FC<LinkItemProps> = ({ link }) => {
  return (
    <div className="w-full justify-between shadow-md bg-secondary flex items-center gap-4 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        {link.icon && (
          <img
            src={link.icon}
            alt={link.title ?? ''}
            className="object-cover rounded-lg w-6 h-6"
          />
        )}

        <p className="font-medium">{link.name ?? link.title}</p>

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-action flex gap-1 items-center"
        >
          {link.url}

          <HiExternalLink />
        </a>

        <div className="hidden gap-2 sm:flex">
          {link.tags.map(tag => (
            <span className="text-slate-400" key={tag.id}>
              #{tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 5 <HiHeart className="text-action" /> */}

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              {link.author.image && (
                <img
                  src={link.author.image}
                  alt={link.author.name}
                  width="24px"
                  height="24px"
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                className="bg-primary-600 text-gray rounded-md min-w-[60px] flex items-center justify-center p-2"
              >
                <p>{link.author.name}</p>
                <Tooltip.Arrow className="fill-primary-600" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </div>
  );
};

export default LinkItem;
