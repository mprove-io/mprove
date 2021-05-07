import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ProjectTeamComponent } from './project-team/project-team.component';

@NgModule({
  declarations: [ProjectSettingsComponent, ProjectTeamComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,

    NgxPaginationModule
  ]
})
export class ProjectModule {}
