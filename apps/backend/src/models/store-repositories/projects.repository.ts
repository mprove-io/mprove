import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class ProjectsRepository extends Repository<entities.ProjectEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.ProjectEntity, dataSource.createEntityManager());
  }
}
