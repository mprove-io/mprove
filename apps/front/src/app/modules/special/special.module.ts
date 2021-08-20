import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OrgDeletedComponent } from './org-deleted/org-deleted.component';
import { OrgOwnerChangedComponent } from './org-owner-changed/org-owner-changed.component';
import { ProjectDeletedComponent } from './project-deleted/project-deleted.component';

@NgModule({
  declarations: [
    OrgDeletedComponent,
    OrgOwnerChangedComponent,
    ProjectDeletedComponent,
    NotFoundComponent,
    LoginSuccessComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class SpecialModule {}
