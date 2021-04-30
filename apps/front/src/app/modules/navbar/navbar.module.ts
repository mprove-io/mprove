import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavbarComponent } from './navbar.component';
import { OrgMenuComponent } from './org-menu/org-menu.component';
import { OrgSelectComponent } from './org-select/org-select.component';
import { ProjectMenuComponent } from './project-menu/project-menu.component';
import { ProjectSelectComponent } from './project-select/project-select.component';
import { UserMenuComponent } from './user-menu/user-menu.component';

@NgModule({
  declarations: [
    NavbarComponent,
    UserMenuComponent,
    OrgSelectComponent,
    OrgMenuComponent,
    ProjectSelectComponent,
    ProjectMenuComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    NgSelectModule
  ]
})
export class NavbarModule {}
