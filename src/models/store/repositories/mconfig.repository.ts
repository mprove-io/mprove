import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.MconfigEntity)
export class MconfigRepository extends Repository<entities.MconfigEntity> {}
