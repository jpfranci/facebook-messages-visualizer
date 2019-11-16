import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import {NgbModule, NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {ChartsModule} from 'ng2-charts';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SearchComponent } from './search-component';
import { ChartComponent } from './chart-component';
import { DatePickerComponent } from './date-picker-component';
import { ModalModule } from 'ngx-bootstrap';
import { FilterParticipantsComponent } from './filter-participants-component';

@NgModule({
  declarations: [HomeComponent, SearchComponent, ChartComponent, DatePickerComponent, FilterParticipantsComponent],
  imports: [
    CommonModule, 
    SharedModule, 
    HomeRoutingModule, 
    CoreModule, 
    AlertModule.forRoot(), 
    NgbModule,
    TabsModule.forRoot(),
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    ChartsModule,
    NgbAccordionModule,
    ModalModule.forRoot()
  ]
})
export class HomeModule {}
