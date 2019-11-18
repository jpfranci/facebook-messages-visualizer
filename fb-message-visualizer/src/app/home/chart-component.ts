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
export class ChartComponent {
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
  private _chartControl: ChartControl;
  private _startDate: NgbDateStruct;
  private _endDate: NgbDateStruct;

  constructor(private _messageFormatterService: MessageFormatterService, 
              private _messageProvider: MessageProvider,
              private _graphMessageProvider: GraphMessageProvider) {
    this._chartControl = new ChartControl(_messageFormatterService, _graphMessageProvider);
  }
}