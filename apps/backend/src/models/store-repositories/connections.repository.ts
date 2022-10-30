import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class ConnectionsRepository extends Repository<entities.ConnectionEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.ConnectionEntity, dataSource.createEntityManager());
  }
}
