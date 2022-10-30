import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class VizsRepository extends Repository<entities.VizEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.VizEntity, dataSource.createEntityManager());
  }
}
