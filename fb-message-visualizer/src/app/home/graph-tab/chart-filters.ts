import {Component, Input} from "@angular/core";
import {ChartControl} from "../control/chart-control";

@Component({
    selector: 'chart-filters',
    templateUrl: './chart-filters.html',
    styleUrls: ['./chart-filters.scss']
  })
export class ChartFilters {
  @Input() control: ChartControl;
}
