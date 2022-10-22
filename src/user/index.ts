import { Attributes } from 'onecore';

export interface User {
  id: string;
  userName: string;
  email?: string;
  phone?: string;
  status?: boolean;
  createdDate?: string;
}

export const userModelAttributes: Attributes = {
  id: {
    key: true,
    length: 11,
    column: 'id'
  },
  userName: {
    length: 10,
    required: true,
    column: 'username'
  }
};
