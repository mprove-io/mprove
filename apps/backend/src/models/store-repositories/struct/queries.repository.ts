import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class QueriesRepository extends Repository<entities.QueryEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.QueryEntity, dataSource.createEntityManager());
  }
}
