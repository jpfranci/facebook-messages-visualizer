import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ChartOptions, ChartType } from "chart.js";
import { SingleDataSet, BaseChartDirective } from "ng2-charts";
import { MessageFormatterService } from "../core/services/fb-message-loader/message-formatter-service";
import { ConversationModel, WordModel } from "../core/models";
import { ChartControl } from "./control/chart-control";
import { NgbDateStruct, NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import { MessageProvider } from "../core/services";

@Component({
    selector: 'chart-component',
    templateUrl: './chart-component.html',
    styleUrls: ['./chart-component.scss']
  })
export class ChartComponent implements OnChanges {
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
  @Input() rawDataset: ConversationModel | WordModel; 
  @Input() participants: Array<string>;
  private _chartControl: ChartControl;
  private _startDate: NgbDateStruct;
  private _endDate: NgbDateStruct;

  constructor(private _messageFormatterService: MessageFormatterService, private _messageProvider: MessageProvider) {
    this._chartControl = new ChartControl(_messageFormatterService);
  }

  ngOnChanges(changes: SimpleChanges) {
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
        this._chartControl.showDefaultGraph(this.rawDataset, this.participants);
      } else {
        this._chartControl.showDefaultGraph(this.rawDataset);
      }
    }
  }
}