import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.MconfigEntity)
export class MconfigsRepository extends Repository<entities.MconfigEntity> {}
