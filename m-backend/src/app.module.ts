import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitService } from './services/rabbit.service';
import { UserEntity } from 'src/store-entities/user.entity';
import { api } from './barrels/api';
import { ToDiskCreateOrganizationController } from './controllers/to-disk/1_organizations/to-disk-create-organization.controller';
import { ToDiskCreateProjectController } from './controllers/to-disk/2_projects/to-disk-create-project.controller';
import { ToDiskCreateDevRepoController } from './controllers/to-disk/3_repos/to-disk-create-dev-repo.controller';
import { ToDiskCreateBranchController } from './controllers/to-disk/5_branches/to-disk-create-branch.controller';
import { ToDiskCreateFolderController } from './controllers/to-disk/6_folders/to-disk-create-folder.controller';
import { ToDiskCreateFileController } from './controllers/to-disk/7_files/to-disk-create-file.controller';
import { ToDiskSaveFileController } from './controllers/to-disk/7_files/to-disk-save-file.controller';
import { ToDiskIsOrganizationExistController } from './controllers/to-disk/1_organizations/to-disk-is-organization-exist.controller';
import { ToDiskIsProjectExistController } from './controllers/to-disk/2_projects/to-disk-is-project-exist.controller';
import { ToDiskIsBranchExistController } from './controllers/to-disk/5_branches/to-disk-is-branch-exist.controller';
import { ToDiskGetFileController } from './controllers/to-disk/7_files/to-disk-get-file.controller';
import { ToDiskDeleteOrganizationController } from './controllers/to-disk/1_organizations/to-disk-delete-organization.controller';
import { ToDiskDeleteProjectController } from './controllers/to-disk/2_projects/to-disk-delete-project.controller';
import { ToDiskDeleteDevRepoController } from './controllers/to-disk/3_repos/to-disk-delete-dev-repo.controller';
import { ToDiskDeleteBranchController } from './controllers/to-disk/5_branches/to-disk-delete-branch.controller';
import { ToDiskDeleteFolderController } from './controllers/to-disk/6_folders/to-disk-delete-folder.controller';
import { ToDiskDeleteFileController } from './controllers/to-disk/7_files/to-disk-delete-file.controller';
import { ToDiskCommitRepoController } from './controllers/to-disk/3_repos/to-disk-commit-repo.controller';
import { ToDiskPushRepoController } from './controllers/to-disk/3_repos/to-disk-push-repo.controller';
import { ToDiskGetCatalogFilesController } from './controllers/to-disk/4_catalogs/to-disk-get-catalog-files.controller';
import { ToDiskGetCatalogNodesController } from './controllers/to-disk/4_catalogs/to-disk-get-catalog-nodes.controller';
import { ToDiskMoveCatalogNodeController } from './controllers/to-disk/4_catalogs/to-disk-move-catalog-node.controller';
import { ToDiskRenameCatalogNodeController } from './controllers/to-disk/4_catalogs/to-disk-rename-catalog-node.controller';
import { ToDiskPullRepoController } from './controllers/to-disk/3_repos/to-disk-pull-repo.controller';
import { ToDiskMergeRepoController } from './controllers/to-disk/3_repos/to-disk-merge-repo.controller';
import { ToDiskRevertRepoToLastCommitController } from './controllers/to-disk/3_repos/to-disk-revert-repo-to-last-commit.controller';
import { ToDiskRevertRepoToProductionController } from './controllers/to-disk/3_repos/to-disk-revert-repo-to-production.controller';
import { ToDiskSeedProjectController } from './controllers/to-disk/8_seed/to-disk-seed-project.controller';
import { ToBlockmlRebuildStructController } from './controllers/to-blockml/to-blockml-rebuild-struct.controller';
import { ToBlockmlProcessDashboardController } from './controllers/to-blockml/to-blockml-process-dashboard.controller';
import { ToBlockmlProcessQueryController } from './controllers/to-blockml/to-blockml-process-query.controller';
import { SpecialRebuildStructController } from './controllers/special/special-rebuild-struct.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: api.RabbitExchangesEnum.MBlockml.toString(),
          type: 'direct'
        },
        {
          name: api.RabbitExchangesEnum.MDisk.toString(),
          type: 'direct'
        }
      ],
      uri: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit:5672`
      ],
      connectionInitOptions: { wait: false }
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'root',
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [UserEntity]
      // synchronize: true
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
    ToDiskMergeRepoController,
    ToDiskPullRepoController,
    ToDiskPushRepoController,
    ToDiskRevertRepoToLastCommitController,
    ToDiskRevertRepoToProductionController,

    ToDiskGetCatalogFilesController,
    ToDiskGetCatalogNodesController,
    ToDiskMoveCatalogNodeController,
    ToDiskRenameCatalogNodeController,

    ToDiskCreateBranchController,
    ToDiskDeleteBranchController,
    ToDiskIsBranchExistController,

    ToDiskCreateFolderController,
    ToDiskDeleteFolderController,

    ToDiskCreateFileController,
    ToDiskDeleteFileController,
    ToDiskGetFileController,
    ToDiskSaveFileController,

    ToDiskSeedProjectController,
    //
    ToBlockmlProcessDashboardController,
    ToBlockmlProcessQueryController,
    ToBlockmlRebuildStructController,
    //
    SpecialRebuildStructController
  ],
  providers: [RabbitService]
})
export class AppModule {}
