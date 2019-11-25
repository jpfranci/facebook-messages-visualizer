import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import {NgbModule, NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {ChartsModule} from 'ng2-charts';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SearchComponent } from './graph-tab/search-component';
import { ChartComponent } from './graph-tab/chart-component';
import { DatePickerComponent } from './graph-tab/date-picker-component';
import { ModalModule } from 'ngx-bootstrap';
import { FilterParticipantsComponent } from './graph-tab/filter-participants-component';
import { ChartTypeFilterComponent } from './graph-tab/chart-type-filter-component';
import { GroupFilterComponent } from './graph-tab/group-filter-component';
import { TotalFilterComponent } from './graph-tab/total-filter-component';
import { SummaryTabComponent } from './summary-tab/summary-tab-component';
import { faCalendar, faCalendarAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import { ChartFilters } from './graph-tab/chart-filters';
import {SummariesComponent} from "./summary-tab/summaries-component";
import {ChartModalComponent} from "./summary-tab/chart-modal-component";
import {SelectDateTypeComponent} from "./summary-tab/select-date-type-component";
import {XAxisSelectionComponent} from "./graph-tab/x-axis-selection-component";
import {ReactionPickerComponent} from "./summary-tab/reaction-picker-component";
import {WordSummaryGridComponent} from "./word-summary-tab/word-summary-grid.component";
import { AgGridModule } from '@ag-grid-community/angular'
import {WordSummaryTabComponent} from "./word-summary-tab/word-summary-tab-component";
import {ConversationPickerComponent} from "./graph-tab/conversation-picker-component";


@NgModule({
  declarations: [
    HomeComponent,
    SearchComponent,
    ChartComponent,
    DatePickerComponent,
    FilterParticipantsComponent,
    ChartTypeFilterComponent,
    GroupFilterComponent,
    TotalFilterComponent,
    SummaryTabComponent,
    ChartFilters,
    SummariesComponent,
    ChartModalComponent,
    SelectDateTypeComponent,
    XAxisSelectionComponent,
    ReactionPickerComponent,
    WordSummaryGridComponent,
    WordSummaryTabComponent,
    ConversationPickerComponent
  ],
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
    ModalModule.forRoot(),
    FontAwesomeModule,
    AgGridModule.withComponents([])
  ]
})
export class HomeModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(faCalendarAlt, faCog);
  }
}
