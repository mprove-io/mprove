import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.DashboardEntity)
export class DashboardsRepository extends Repository<entities.DashboardEntity> {}
