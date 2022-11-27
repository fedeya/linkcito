import type { Link, Tag, Author } from '@linkcito/db';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { forwardRef, useCallback } from 'react';
import { useFetcher } from '@remix-run/react';
import LinkItem from './LinkItem';
import { Virtuoso } from 'react-virtuoso';

type LinksListProps = {
  links: Array<
    Partial<Link> & {
      tags: Partial<Tag>[];
      author?: Pick<Author, 'name' | 'image'>;
    }
  >;
  isSubmitting?: boolean;
  guildId: string;
  tags?: string[];
};

const List = forwardRef<HTMLDivElement>((props, ref) => {
  return <div {...props} className="flex flex-col gap-4" ref={ref} />;
});

List.displayName = 'List';

const LinksList: FC<LinksListProps> = ({
  links,
  guildId,
  tags,
  isSubmitting
}) => {
  const [items, setItems] = useState(links);
  const [shouldFetch, setShouldFetch] = useState(true);

  const fetcher = useFetcher();

  useEffect(() => {
    setItems(links);
  }, [links]);

  useEffect(() => {
    if (fetcher.data && fetcher.data.links && fetcher.data.links.length === 0) {
      setShouldFetch(false);
      return;
    }

    if (fetcher.data && fetcher.data.links && fetcher.data.links.length !== 0) {
      setItems(items => items.concat(fetcher.data.links));
      setShouldFetch(true);
      return;
    }
  }, [fetcher.data]);

  const loadMore = useCallback(
    (index: number) => {
      if (!shouldFetch) return;

      const url = `/${guildId}/links?${
        tags ? tags.map(tag => `tag=${tag}`) : ''
      }&linkCursorId=${items[index].id}`;

      fetcher.load(url);

      setShouldFetch(false);
    },
    [guildId, fetcher, tags, items, shouldFetch]
  );

  return (
    <div className="w-full space-y-4 max-w-5xl mx-auto">
      {!isSubmitting && (
        <Virtuoso
          useWindowScroll
          overscan={200}
          initialItemCount={items.length}
          totalCount={items.length}
          endReached={loadMore}
          components={{ List }}
          itemContent={index => (
            <LinkItem key={items[index].id} link={items[index]} />
          )}
        />
      )}

      {isSubmitting &&
        new Array(links.length === 0 ? 5 : links.length)
          .fill(1)
          .map((_, i) => (
            <div
              key={i}
              className="h-12 w-full rounded-md bg-secondary animate-pulse"
            />
          ))}
    </div>
  );
};

export default LinksList;
