import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.ViewEntity)
export class ViewRepository extends Repository<entities.ViewEntity> {}
