import { Ui } from '~common/interfaces/backend/ui';
import { UserEnt } from '../schema/users';

export interface UserTab extends Omit<UserEnt, 'st' | 'lt'>, UserSt, UserLt {}

export class UserSt {
  emptyData?: number;
}

export class UserLt {
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  emailVerificationToken: string;
  passwordResetToken: string;
  passwordResetExpiresTs: number;
  ui: Ui;
}
