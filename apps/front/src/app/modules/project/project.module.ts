import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TippyModule } from '@ngneat/helipopper';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
import { ProjectConnectionsComponent } from './project-connections/project-connections.component';
import { ProjectEnvironmentsComponent } from './project-environments/project-environments.component';
import { ProjectEvsComponent } from './project-evs/project-evs.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ProjectTeamComponent } from './project-team/project-team.component';

@NgModule({
  declarations: [
    ProjectSettingsComponent,
    ProjectTeamComponent,
    ProjectConnectionsComponent,
    ProjectEnvironmentsComponent,
    ProjectEvsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    NgxPaginationModule,
    TippyModule
  ]
})
export class ProjectModule {}
