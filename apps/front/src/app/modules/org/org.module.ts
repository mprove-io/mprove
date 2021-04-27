import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { OrgAccountComponent } from './org-account/org-account.component';

@NgModule({
  declarations: [OrgAccountComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class OrgModule {}
