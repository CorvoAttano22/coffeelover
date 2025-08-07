import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  //the subject of token
  sub: number;

  //user's additional information
  email: string;

  //role of the user
  role: Role;
}
