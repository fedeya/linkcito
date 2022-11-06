export interface User {
  profile: {
    id: string;
    name?: string;
    email?: string;
  };
  accessToken: string;
}
