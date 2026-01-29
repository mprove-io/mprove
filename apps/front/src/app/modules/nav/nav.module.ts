import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavComponent } from './nav.component';

@NgModule({
  declarations: [NavComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule]
})
export class NavModule {}
