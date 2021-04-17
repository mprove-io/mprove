import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProComponent } from './pro/pro.component';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [ProfileComponent, ProComponent],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileModule {}
