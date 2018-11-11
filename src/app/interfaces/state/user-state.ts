import * as api from 'src/app/api/_index';

export interface UserState extends api.User {
  loading: boolean;
  loaded: boolean;
}
