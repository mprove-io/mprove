import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.ErrorEntity)
export class ErrorRepository extends Repository<entities.ErrorEntity> {}
