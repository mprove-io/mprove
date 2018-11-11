import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as components from 'src/app/components/_index';
import { MyMaterialModule } from 'src/app/modules/my-material.module';
import { SharedModule } from 'src/app/modules/shared.module';
import { ValidationMsgModule } from 'src/app/modules/validation-msg.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule,
    ValidationMsgModule,
  ],
  declarations: [
    components.ProjectSetupComponent,
    components.ProjectSelectComponent,
    components.UserComponent,
    components.DocsLinkComponent,
    components.ForumLinkComponent,
    components.LogoComponent,
    components.ThemePickerComponent,
  ],
  entryComponents: [
  ],
  exports: [
    components.ProjectSetupComponent,
    components.ProjectSelectComponent,
    components.UserComponent,
    components.DocsLinkComponent,
    components.ForumLinkComponent,
    components.LogoComponent,
  ]
})

export class MenuModule {
}
