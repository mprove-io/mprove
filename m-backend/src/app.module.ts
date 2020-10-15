import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitService } from './services/rabbit.service';
import { api } from './barrels/api';
import { ToDiskCreateOrganizationController } from './controllers/to-disk/to-disk-create-organization.controller';
import { ToDiskCreateProjectController } from './controllers/to-disk/to-disk-create-project.controller';
import { ToDiskCreateDevRepoController } from './controllers/to-disk/to-disk-create-dev-repo.controller';
import { ToDiskGetRepoCatalogFilesController } from './controllers/to-disk/to-disk-get-repo-catalog-files.controller';
import { ToDiskGetRepoCatalogNodesController } from './controllers/to-disk/to-disk-get-repo-catalog-nodes.controller';
import { ToDiskCreateBranchController } from './controllers/to-disk/to-disk-create-branch.controller';
import { ToDiskCreateFileController } from './controllers/to-disk/to-disk-create-file.controller';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        // {
        //   name: api.M_BLOCKML,
        //   type: 'direct'
        // },
        {
          name: api.M_DISK,
          type: 'direct'
        }
      ],
      uri: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit:5672`
      ],
      connectionInitOptions: { wait: false }
    })
  ],
  controllers: [
    ToDiskCreateOrganizationController,
    ToDiskCreateProjectController,
    ToDiskCreateDevRepoController,
    ToDiskGetRepoCatalogFilesController,
    ToDiskGetRepoCatalogNodesController,
    ToDiskCreateBranchController,
    ToDiskCreateFileController
  ],
  providers: [RabbitService]
})
export class AppModule {}
