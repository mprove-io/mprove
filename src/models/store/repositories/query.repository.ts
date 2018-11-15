import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.QueryEntity)
export class QueryRepository extends Repository<entities.QueryEntity> {}
