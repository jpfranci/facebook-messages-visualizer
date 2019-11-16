import { MessageFormatterService } from "../../core/services/fb-message-loader/message-formatter-service";
import { ChartOptions, TimeUnit } from "chart.js";
import { ConversationModel } from "../../core/models/conversation-model";
import { SingleDataSet } from "ng2-charts";
import { WordModel, ConversationModelConversions, WordModelConversions } from "../../core/models";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export class ChartControl {
    private _chartOptions: ChartOptions; 

    public dataset: Array<{data: SingleDataSet, label: string}>;
    public chartOptions: ChartOptions;
    public chartType: string;

    private _participants: Array<string>
    private _startDate: string;
    private _endDate: string;
    public _model: ConversationModel | WordModel;

    constructor(private _messageFormatterService: MessageFormatterService) {
        this.dataset = [{data: [], label: ""}];
        this._initChartOptions();
    }

    private _initChartOptions() {
        this.chartType = "line";
        this.chartOptions = {
            responsive: true,
            title: {
                display: true,
                text: "Message Count by Month",
                fontSize: 15
            },
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: "time",
                    distribution: "series",
                    time: {
                        unit: 'month'
                    },
                    ticks: {
                        maxTicksLimit: 15
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }
    
  public showDefaultGraph(
    model: ConversationModel | WordModel, 
    participants?: Array<string>, 
    startDate?: string, 
    endDate?: string): void {
        let participantsToUse: string[] = participants ? participants : this._getAllParticipants(model);
        if (this._model !== model) {
            this._model = model;
            participantsToUse = this._getAllParticipants(model);
        }
        const startDateToUse = startDate ? startDate: model.startDate;
        const endDateToUse = endDate ? endDate : model.endDate;
        this._participants = participantsToUse;
        this._startDate = startDateToUse;
        this._endDate = endDateToUse;
        
        let dataSetAndUnit = this._messageFormatterService.getTotalDates(
            JSON.parse(model.dates),
            startDateToUse,
            endDateToUse,
            this.chartOptions.scales.xAxes[0].ticks.maxTicksLimit,
            participantsToUse
        )
        this.dataset = dataSetAndUnit.dataset;
        if (model.hasOwnProperty("word")) {
            this.chartOptions.title.text = `Message Count of ${this.capitalizeFirstLetter((<WordModel>model).word)} by ${this.capitalizeFirstLetter(dataSetAndUnit.unit)} for Chat with ${model.displayName}`;
        } else {
            this.chartOptions.title.text = `Message Count by ${this.capitalizeFirstLetter(dataSetAndUnit.unit)} for Chat with ${model.displayName}`;
        }
        if (dataSetAndUnit.unit === 'quarter') {
            dataSetAndUnit.unit = 'month';
        }
        this.chartOptions.scales.xAxes[0].time.unit = <TimeUnit> dataSetAndUnit.unit;
        this.chartOptions = Object.assign({}, this.chartOptions);
  }

  private _getAllParticipants(model: ConversationModel | WordModel): Array<string> {
      if (model.hasOwnProperty('participants')) {
        return ConversationModelConversions.toParticipantsArray(<ConversationModel> model);
      } else {
          return WordModelConversions.toAvailableParticipants(<WordModel> model);
      }
  }

  public changeStartDate(startDate: NgbDateStruct) {
      this.showDefaultGraph(this._model, this._participants, this.dateStructToDate(startDate),  this._endDate);
  }

  public changeEndDate(endDate: NgbDateStruct) {
    this.showDefaultGraph(this._model, this._participants, this._startDate, this.dateStructToDate(endDate));

  }

  public dateStructToDate(date: NgbDateStruct): string {
      return new Date(`${date.month} ${date.day} ${date.year}`).toString();
  }

  private capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
