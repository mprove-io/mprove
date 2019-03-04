import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.SessionEntity)
export class SessionRepository extends Repository<entities.SessionEntity> {
}
