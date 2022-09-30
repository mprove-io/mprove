import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.EvEntity)
export class EvsRepository extends Repository<entities.EvEntity> {}
