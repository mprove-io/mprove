import { CdkMenuModule } from '@angular/cdk/menu';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { BranchSelectComponent } from './branch-select/branch-select.component';
import { EnvSelectComponent } from './env-select/env-select.component';
import { NavbarComponent } from './navbar.component';
import { OrgMenuComponent } from './org-menu/org-menu.component';
import { ProjectMenuComponent } from './project-menu/project-menu.component';
import { UserMenuComponent } from './user-menu/user-menu.component';

@NgModule({
  declarations: [
    NavbarComponent,
    UserMenuComponent,
    BranchSelectComponent,
    OrgMenuComponent,
    ProjectMenuComponent,
    EnvSelectComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    NgSelectModule,
    CdkMenuModule,
    ScrollingModule,
    TippyDirective
  ]
})
export class NavbarModule {}
