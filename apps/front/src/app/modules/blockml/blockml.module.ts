import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { BlockmlComponent } from './blockml.component';

@NgModule({
  declarations: [BlockmlComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule]
})
export class BlockmlModule {}
