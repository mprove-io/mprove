import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.IdempEntity)
export class IdempsRepository extends Repository<entities.IdempEntity> {}
