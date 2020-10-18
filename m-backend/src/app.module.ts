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
import { ToDiskCreateFolderController } from './controllers/to-disk/to-disk-create-folder.controller';
import { ToDiskSaveFileController } from './controllers/to-disk/to-disk-save-file.controller';
import { ToDiskGetFileController } from './controllers/to-disk/to-disk-get-file.controller';

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
    ToDiskCreateBranchController,
    ToDiskCreateFolderController,
    ToDiskCreateFileController,
    ToDiskGetRepoCatalogFilesController,
    ToDiskGetRepoCatalogNodesController,
    ToDiskSaveFileController,
    ToDiskGetFileController
  ],
  providers: [RabbitService]
})
export class AppModule {}
