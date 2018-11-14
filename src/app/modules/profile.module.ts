// tslint:disable:max-line-length
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// import { ImageUploadComponent } from './image-upload/image-upload.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as components from 'app/components/_index';
import { MyCovalentModule } from 'app/modules/my-covalent.module';
import { MyMaterialModule } from 'app/modules/my-material.module';
import { SharedModule } from 'app/modules/shared.module';
import { ValidationMsgModule } from 'app/modules/validation-msg.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    ReactiveFormsModule,
    ValidationMsgModule,
    FormsModule,
    FlexLayoutModule,
    MyCovalentModule
  ],
  declarations: [
    components.ProfileComponent,
    components.EditNameComponent,
    components.UpdateUserTimezoneComponent
    // ImageUploadComponent,
  ],
  entryComponents: [
    // ImageUploadComponent
  ],
  exports: [components.ProfileComponent]
})
export class ProfileModule {}
