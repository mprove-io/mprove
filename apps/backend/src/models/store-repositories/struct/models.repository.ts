import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class ModelsRepository extends Repository<entities.ModelEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.ModelEntity, dataSource.createEntityManager());
  }
}
