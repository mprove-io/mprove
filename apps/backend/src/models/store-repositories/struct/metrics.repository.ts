import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class MetricsRepository extends Repository<entities.MetricEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.MetricEntity, dataSource.createEntityManager());
  }
}
