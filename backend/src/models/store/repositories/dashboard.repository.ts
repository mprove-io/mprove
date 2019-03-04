import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.DashboardEntity)
export class DashboardRepository extends Repository<entities.DashboardEntity> {}
