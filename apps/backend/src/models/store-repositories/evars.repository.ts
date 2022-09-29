import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.EvarEntity)
export class EvarsRepository extends Repository<entities.EvarEntity> {}
