import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.MemberEntity)
export class MembersRepository extends Repository<entities.MemberEntity> {}
