import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared/shared.module';
import { OrgAccountComponent } from './org-account/org-account.component';
import { OrgUsersComponent } from './org-users/org-users.component';

@NgModule({
  declarations: [OrgAccountComponent, OrgUsersComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    TippyDirective
  ]
})
export class OrgModule {}
