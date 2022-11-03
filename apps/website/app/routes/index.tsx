import { Container, Text, Button } from '@nextui-org/react';

export default function Index() {
  return (
    <Container
      fluid
      display="flex"
      css={{ width: '100%', minHeight: '100vh', flexDirection: 'column' }}
      gap={12}
      justify="center"
      alignItems="center"
    >
      <Text css={{ m: 0 }} size={78} h1>
        #Linkcitos
      </Text>

      <Text size={20} css={{ m: 0 }}>
        Resources bot saver
      </Text>

      <Button
        as="a"
        href="https://discord.com/api/oauth2/authorize?client_id=1037163235901722705&permissions=277025392640&scope=bot"
        color="secondary"
        shadow
        css={{ mt: 20 }}
      >
        Invite
      </Button>
    </Container>
  );
}
