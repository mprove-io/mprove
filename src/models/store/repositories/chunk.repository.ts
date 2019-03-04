import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.ChunkEntity)
export class ChunkRepository extends Repository<entities.ChunkEntity> {
}
