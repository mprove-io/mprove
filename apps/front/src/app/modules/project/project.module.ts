import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';

@NgModule({
  declarations: [ProjectSettingsComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule]
})
export class ProjectModule {}
