import { entities } from '~/barrels/entities';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(entities.UserEntity)
export class UserRepository extends Repository<entities.UserEntity> {}
