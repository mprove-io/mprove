import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitService } from './services/rabbit.service';
import { api } from './barrels/api';
import { ToDiskCreateOrganizationController } from './controllers/to-disk/1_organizations/to-disk-create-organization.controller';
import { ToDiskCreateProjectController } from './controllers/to-disk/2_projects/to-disk-create-project.controller';
import { ToDiskCreateDevRepoController } from './controllers/to-disk/3_repos/to-disk-create-dev-repo.controller';
import { ToDiskCreateBranchController } from './controllers/to-disk/4_branches/to-disk-create-branch.controller';
import { ToDiskCreateFolderController } from './controllers/to-disk/5_folders/to-disk-create-folder.controller';
import { ToDiskCreateFileController } from './controllers/to-disk/6_files/to-disk-create-file.controller';
import { ToDiskGetRepoCatalogFilesController } from './controllers/to-disk/3_repos/to-disk-get-repo-catalog-files.controller';
import { ToDiskGetRepoCatalogNodesController } from './controllers/to-disk/3_repos/to-disk-get-repo-catalog-nodes.controller';
import { ToDiskSaveFileController } from './controllers/to-disk/6_files/to-disk-save-file.controller';
import { ToDiskMoveNodeController } from './controllers/to-disk/3_repos/to-disk-move-node.controller';
import { ToDiskIsOrganizationExistController } from './controllers/to-disk/1_organizations/to-disk-is-organization-exist.controller';
import { ToDiskIsProjectExistController } from './controllers/to-disk/2_projects/to-disk-is-project-exist.controller';
import { ToDiskRenameNodeController } from './controllers/to-disk/3_repos/to-disk-rename-node.controller';
import { ToDiskIsBranchExistController } from './controllers/to-disk/4_branches/to-disk-is-branch-exist.controller';
import { ToDiskGetFileController } from './controllers/to-disk/6_files/to-disk-get-file.controller';
import { ToDiskDeleteOrganizationController } from './controllers/to-disk/1_organizations/to-disk-delete-organization.controller';
import { ToDiskDeleteProjectController } from './controllers/to-disk/2_projects/to-disk-delete-project.controller';
import { ToDiskDeleteDevRepoController } from './controllers/to-disk/3_repos/to-disk-delete-dev-repo.controller';
import { ToDiskDeleteBranchController } from './controllers/to-disk/4_branches/to-disk-delete-branch.controller';
import { ToDiskDeleteFolderController } from './controllers/to-disk/5_folders/to-disk-delete-folder.controller';
import { ToDiskDeleteFileController } from './controllers/to-disk/6_files/to-disk-delete-file.controller';
import { ToDiskCommitRepoController } from './controllers/to-disk/3_repos/to-disk-commit-repo.controller';
import { ToDiskPushRepoController } from './controllers/to-disk/3_repos/to-disk-push-repo.controller';

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
    ToDiskDeleteOrganizationController,
    ToDiskIsOrganizationExistController,

    ToDiskCreateProjectController,
    ToDiskDeleteProjectController,
    ToDiskIsProjectExistController,

    ToDiskCommitRepoController,
    ToDiskCreateDevRepoController,
    ToDiskDeleteDevRepoController,
    ToDiskGetRepoCatalogFilesController,
    ToDiskGetRepoCatalogNodesController,
    ToDiskMoveNodeController,
    ToDiskPushRepoController,
    ToDiskRenameNodeController,

    ToDiskCreateBranchController,
    ToDiskDeleteBranchController,
    ToDiskIsBranchExistController,

    ToDiskCreateFolderController,
    ToDiskDeleteFolderController,

    ToDiskCreateFileController,
    ToDiskDeleteFileController,
    ToDiskGetFileController,
    ToDiskSaveFileController
  ],
  providers: [RabbitService]
})
export class AppModule {}
