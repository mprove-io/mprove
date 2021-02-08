import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.UserEntity)
export class UsersRepository extends Repository<entities.UserEntity> {}
