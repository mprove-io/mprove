import * as api from '@app/api/_index';

export interface ModelGroup {
  gr: string;
  models: api.Model[];
}
