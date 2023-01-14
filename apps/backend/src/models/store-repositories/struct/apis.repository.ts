import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class ApisRepository extends Repository<entities.ApiEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.ApiEntity, dataSource.createEntityManager());
  }
}
