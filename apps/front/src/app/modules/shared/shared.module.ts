import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AvatarComponent } from './avatar/avatar.component';
import { LogoComponent } from './logo/logo.component';
import { CheckIconComponent } from './symbols/check-icon/check-icon.component';
import { CompletedRingComponent } from './symbols/completed-ring/completed-ring.component';
import { DeleteIconComponent } from './symbols/delete-icon/delete-icon.component';
import { EmailRingComponent } from './symbols/email-ring/email-ring.component';
import { SettingsIconComponent } from './symbols/settings-icon/settings-icon.component';
import { ValidationComponent } from './validation/validation.component';

let sharedComponents = [
  LogoComponent,
  CompletedRingComponent,
  EmailRingComponent,
  ValidationComponent,
  AvatarComponent,
  SettingsIconComponent,
  DeleteIconComponent,
  CheckIconComponent
];

@NgModule({
  declarations: [...sharedComponents],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [...sharedComponents]
})
export class SharedModule {}
