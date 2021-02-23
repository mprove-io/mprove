import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.AvatarEntity)
export class AvatarsRepository extends Repository<entities.AvatarEntity> {}
