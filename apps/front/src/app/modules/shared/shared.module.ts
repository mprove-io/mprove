import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from './logo/logo.component';
import { CompletedRingComponent } from './symbols/completed-ring/completed-ring.component';
import { EmailRingComponent } from './symbols/email-ring/email-ring.component';

let sharedComponents = [
  LogoComponent,
  CompletedRingComponent,
  EmailRingComponent
];

@NgModule({
  declarations: [...sharedComponents],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [...sharedComponents]
})
export class SharedModule {}
