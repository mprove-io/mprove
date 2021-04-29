import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AvatarComponent } from './avatar/avatar.component';
import { LogoComponent } from './logo/logo.component';
import { CompletedRingComponent } from './symbols/completed-ring/completed-ring.component';
import { EmailRingComponent } from './symbols/email-ring/email-ring.component';
import { SettingsIconComponent } from './symbols/settings-icon/settings-icon.component';
import { ValidationComponent } from './validation/validation.component';

let sharedComponents = [
  LogoComponent,
  CompletedRingComponent,
  EmailRingComponent,
  ValidationComponent,
  AvatarComponent,
  SettingsIconComponent
];

@NgModule({
  declarations: [...sharedComponents],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [...sharedComponents]
})
export class SharedModule {}
