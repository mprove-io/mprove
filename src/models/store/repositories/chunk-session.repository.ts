import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.ChunkSessionEntity)
export class ChunkSessionRepository extends Repository<
  entities.ChunkSessionEntity
> {}
