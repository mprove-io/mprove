import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { OrgDeletedComponent } from './org-deleted/org-deleted.component';
import { OrgOwnerChangedComponent } from './org-owner-changed/org-owner-changed.component';
import { ProjectDeletedComponent } from './project-deleted/project-deleted.component';

@NgModule({
  declarations: [
    OrgDeletedComponent,
    OrgOwnerChangedComponent,
    ProjectDeletedComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class SpecialModule {}
