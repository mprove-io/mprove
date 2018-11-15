import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.MemberEntity)
export class MemberRepository extends Repository<entities.MemberEntity> {}
