import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import * as components from 'app/components/_index';
import { MenuModule } from 'app/modules/menu.module';
import { MyMaterialModule } from 'app/modules/my-material.module';
import { ProfileModule } from 'app/modules/profile.module';
import { ProjectModule } from 'app/modules/project.module';
import { SharedModule } from 'app/modules/shared.module';
import { ValidationMsgModule } from 'app/modules/validation-msg.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    FlexLayoutModule,
    MenuModule,
    ProfileModule,
    ProjectModule,
    RouterModule,
    ValidationMsgModule,
    ReactiveFormsModule
  ],
  declarations: [
    components.NavDevProdComponent,
    components.NavBlockmlComponent,
    components.NavModelsComponent,
    components.NavDashboardsComponent,
    components.NavRemoteErrorsComponent,
    components.SpaceComponent,
    components.ProjectDeletedComponent,
    components.RegisterComponent,
    components.LoginComponent,
    components.LogoutComponent,
    components.NotFound404Component
  ],
  exports: [components.SpaceComponent]
})
export class SpaceModule {}
