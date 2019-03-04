import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.ModelEntity)
export class ModelRepository extends Repository<entities.ModelEntity> {
}
