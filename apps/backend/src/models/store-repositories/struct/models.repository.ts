import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.ModelEntity)
export class ModelsRepository extends Repository<entities.ModelEntity> {}
