import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.BridgeEntity)
export class BridgesRepository extends Repository<entities.BridgeEntity> {}
