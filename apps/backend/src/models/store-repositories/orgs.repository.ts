import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.OrgEntity)
export class OrgsRepository extends Repository<entities.OrgEntity> {}
