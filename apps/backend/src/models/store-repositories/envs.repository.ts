import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.EnvEntity)
export class EnvsRepository extends Repository<entities.EnvEntity> {}
