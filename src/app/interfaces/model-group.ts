import * as api from 'src/app/api/_index';

export interface ModelGroup {
  gr: string;
  models: api.Model[];
}
