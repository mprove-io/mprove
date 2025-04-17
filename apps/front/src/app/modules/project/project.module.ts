import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
import { ProjectConnectionsComponent } from './project-connections/project-connections.component';
import { ProjectEnvironmentsComponent } from './project-environments/project-environments.component';
import { ProjectInfoComponent } from './project-info/project-info.component';
import { ProjectTeamComponent } from './project-team/project-team.component';

@NgModule({
  declarations: [
    ProjectInfoComponent,
    ProjectTeamComponent,
    ProjectConnectionsComponent,
    ProjectEnvironmentsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    NgxPaginationModule,
    TippyDirective
  ]
})
export class ProjectModule {}
