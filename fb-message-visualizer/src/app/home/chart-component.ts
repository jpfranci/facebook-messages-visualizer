import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ChartOptions, ChartType } from "chart.js";
import { SingleDataSet, BaseChartDirective } from "ng2-charts";

@Component({
    selector: 'chart-component',
    templateUrl: './chart-component.html',
    styleUrls: ['./chart-component.scss']
  })
export class ChartComponent implements OnChanges {
    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
    @Input() dataset: Array<{data: SingleDataSet, label: string}>;
    @Input() chartType: ChartType;
    @Input() chartOptions: ChartOptions;

    ngOnChanges(changes: SimpleChanges) {
    }
}