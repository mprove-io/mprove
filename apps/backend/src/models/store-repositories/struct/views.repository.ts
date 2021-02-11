import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.ViewEntity)
export class ViewsRepository extends Repository<entities.ViewEntity> {}
