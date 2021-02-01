import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.UserEntity)
export class UserRepository extends Repository<entities.UserEntity> {}
