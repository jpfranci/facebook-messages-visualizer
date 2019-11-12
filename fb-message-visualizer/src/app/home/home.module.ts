import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from 'ngx-bootstrap/alert';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, CoreModule, AlertModule.forRoot()]
})
export class HomeModule {}
