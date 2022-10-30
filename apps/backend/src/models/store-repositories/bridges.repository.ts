import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class BridgesRepository extends Repository<entities.BridgeEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.BridgeEntity, dataSource.createEntityManager());
  }
}
