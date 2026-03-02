import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SharedModule } from '../shared/shared.module';
import { ProjectApiKeysComponent } from './project-api-keys/project-api-keys.component';
import { ProjectConnectionsComponent } from './project-connections/project-connections.component';
import { ProjectEnvironmentsComponent } from './project-environments/project-environments.component';
import { ProjectInfoComponent } from './project-info/project-info.component';
import { ProjectTeamComponent } from './project-team/project-team.component';

@NgModule({
  declarations: [
    ProjectInfoComponent,
    ProjectTeamComponent,
    ProjectConnectionsComponent,
    ProjectEnvironmentsComponent,
    ProjectApiKeysComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    NgxPaginationModule,
    TippyDirective,
    NgScrollbarModule
  ]
})
export class ProjectModule {}
