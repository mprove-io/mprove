import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CompletedComponent } from './completed/completed.component';
import { LogoComponent } from './logo/logo.component';

@NgModule({
  declarations: [LogoComponent, CompletedComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [LogoComponent, CompletedComponent]
})
export class SharedModule {}
