import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.QueryEntity)
export class QueriesRepository extends Repository<entities.QueryEntity> {}
