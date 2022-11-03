import { Button, Card, Grid, Row, Text, styled } from '@nextui-org/react';
import type { Link, Tag } from '@linkcito/db';
import type { FC } from 'react';
import { HiOutlineFaceFrown } from 'react-icons/hi2';

type LinkCardProps = {
  link: Partial<Link> & { tags: Partial<Tag>[] };
};

const ImageFallback = styled('div', {
  height: 170,
  width: '100%',
  borderRadius: 24,
  backgroundColor: '$secondaryLight',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: '$medium',
  fontSize: 48,
  color: '$black'
});

const LinkCard: FC<LinkCardProps> = ({ link }) => {
  return (
    <Grid lg={3} xs={12} sm={6}>
      <Card variant="shadow">
        <Card.Body>
          <Row>
            {link.image ? (
              <Card.Image
                showSkeleton
                css={{ borderRadius: 24, height: 170, width: '100%' }}
                objectFit="contain"
                src={link.image}
                alt={link.name ?? link.title ?? undefined}
              />
            ) : (
              <ImageFallback>
                <HiOutlineFaceFrown />
              </ImageFallback>
            )}
          </Row>

          <Row>
            <Text h4 css={{ mt: 20, mb: 0 }} size={20}>
              {link.name ?? link.title}
            </Text>
          </Row>

          <Row>
            <Text>{link.description}</Text>
          </Row>

          <Row css={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: 8 }}>
            {link.tags.map(tag => (
              <Text span color="secondary" key={tag.id}>
                #{tag.name}
              </Text>
            ))}
          </Row>
        </Card.Body>
        <Card.Footer>
          <Button
            size="lg"
            shadow
            flat
            as="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            css={{ width: '100%' }}
          >
            Open Link
          </Button>
        </Card.Footer>
      </Card>
    </Grid>
  );
};
export default LinkCard;
