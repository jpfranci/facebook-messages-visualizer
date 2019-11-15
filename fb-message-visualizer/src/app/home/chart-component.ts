import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ChartOptions, ChartType } from "chart.js";
import { SingleDataSet, BaseChartDirective } from "ng2-charts";
import { MessageFormatterService } from "../core/services/fb-message-loader/message-formatter-service";
import { ConversationModel, WordModel } from "../core/models";
import { ChartControl } from "./control/chart-control";

@Component({
    selector: 'chart-component',
    templateUrl: './chart-component.html',
    styleUrls: ['./chart-component.scss']
  })
export class ChartComponent implements OnChanges {
    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
    @Input() rawDataset: ConversationModel | Array<WordModel> 
    private _chartControl: ChartControl;

    constructor(private _messageFormatterService: MessageFormatterService) {
      this._chartControl = new ChartControl(_messageFormatterService);
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes.rawDataset.currentValue.totalWords !== undefined) {
        this._chartControl.showDefaultGraph(changes.rawDataset.currentValue);
      }
    }
}