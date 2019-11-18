import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ChartOptions, ChartType } from "chart.js";
import { SingleDataSet, BaseChartDirective } from "ng2-charts";
import { MessageFormatterService } from "../core/services/fb-message-loader/message-formatter-service";
import { ConversationModel, WordModel } from "../core/models";
import { ChartControl } from "./control/chart-control";
import { NgbDateStruct, NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import { MessageProvider, GraphMessageProvider } from "../core/services";

@Component({
    selector: 'chart-component',
    templateUrl: './chart-component.html',
    styleUrls: ['./chart-component.scss']
  })
export class ChartComponent implements OnChanges {
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
  @Input() rawDataset: ConversationModel | WordModel; 
  @Input() participants: Array<string>;
  @Input() chartType: string;
  @Input() separateElements: boolean;
  @Input() stackElements: boolean;
  @Input() useTotal: boolean;
  private _chartControl: ChartControl;
  private _startDate: NgbDateStruct;
  private _endDate: NgbDateStruct;

  constructor(private _messageFormatterService: MessageFormatterService, 
              private _messageProvider: MessageProvider,
              private _graphMessageProvider: GraphMessageProvider) {
    this._chartControl = new ChartControl(_messageFormatterService);
  }

  ngOnChanges(changes: SimpleChanges) {
    this._chartControl.chartType = this.chartType;
    if (changes.stackElements) {
      this._chartControl.setStacked(this.stackElements);
    }
    if (this.rawDataset) {
      const startDate = new Date(this.rawDataset.startDate);
      const endDate = new Date(this.rawDataset.endDate);
      this._startDate = {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: startDate.getDate()
      };
      this._endDate = {
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1,
        day: endDate.getDate()
      };
      if (this.participants) {
        this._chartControl.showTimeGraph(this.rawDataset, this.separateElements, this.useTotal, this.participants);
      } else {
        this._chartControl.showTimeGraph(this.rawDataset, this.separateElements, this.useTotal);
      }
    }
  }
}