import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class DashboardsRepository extends Repository<entities.DashboardEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.DashboardEntity, dataSource.createEntityManager());
  }
}
