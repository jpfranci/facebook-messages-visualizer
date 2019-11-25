import {Component, Input, ViewChild} from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { MessageFormatterService } from "../../core/services/fb-message-loader/message-formatter-service";
import { ChartControl } from "../control/chart-control";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { GraphMessageProvider, SaveDataService} from "../../core/services";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'chart-component',
    templateUrl: './chart-component.html',
    styleUrls: ['./chart-component.scss']
  })
export class ChartComponent {
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;
  @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
  @Input() isSmall: boolean;
  public _chartControl: ChartControl;
  public _startDate: NgbDateStruct;
  public _endDate: NgbDateStruct;

  constructor(public _messageFormatterService: MessageFormatterService,
              public _graphMessageProvider: GraphMessageProvider,
              saveGraphService: SaveDataService) {
    this._chartControl = new ChartControl(_messageFormatterService, _graphMessageProvider, saveGraphService);
    this._chartControl.startDate.subscribe((startDate) => {
      this._startDate = startDate;
    });
    this._chartControl.endDate.subscribe((endDate) => {
      this._endDate = endDate;
    })
  }

  ngAfterViewInit() {
    this._chartControl.chart = this.chart;
  }
}
