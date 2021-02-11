import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.ConnectionEntity)
export class ConnectionsRepository extends Repository<entities.ConnectionEntity> {}
