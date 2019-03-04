import { interfaces } from '../../barrels/interfaces';
import { refreshServerTs } from './refresh-server-ts';

export function refreshStructServerTs(struct: interfaces.ItemStructAndRepo, newServerTs: string) {
  return {
    errors: refreshServerTs(struct.errors, newServerTs),
    models: refreshServerTs(struct.models, newServerTs),
    dashboards: refreshServerTs(struct.dashboards, newServerTs),
    repo: refreshServerTs([struct.repo], newServerTs)[0],
  };
}
