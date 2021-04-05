import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from './logo/logo.component';

@NgModule({
  declarations: [LogoComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [LogoComponent]
})
export class SharedModule {}
