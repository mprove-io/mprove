import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.StructEntity)
export class StructsRepository extends Repository<entities.StructEntity> {}
