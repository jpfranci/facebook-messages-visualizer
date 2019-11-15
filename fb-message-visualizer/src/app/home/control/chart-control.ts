import { MessageFormatterService } from "../../core/services/fb-message-loader/message-formatter-service";
import { ChartOptions } from "chart.js";
import { ConversationModel } from "../../core/models/conversation-model";
import { SingleDataSet } from "ng2-charts";

export class ChartControl {
    private _chartOptions: ChartOptions; 

    public dataset: Array<{data: SingleDataSet, label: string}>;
    public chartOptions: ChartOptions;
    public chartType: string;

    constructor(private _messageFormatterService: MessageFormatterService) {
        this.dataset = [{data: [], label: ""}];
        this._initChartOptions();
    }

    private _initChartOptions() {
        this.chartType = "bar";
        this.chartOptions = {
            responsive: true,
            title: {
            display: true,
            text: "Message Count by Month"
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
                maxTicksLimit: 20
                }
            }]
            }
        }
    }
    
  public showDefaultGraph(conversationModel: ConversationModel): void {
    this.dataset = this._messageFormatterService.getTotalDates(
        JSON.parse(conversationModel.dates),
        conversationModel.totalMessages,
        conversationModel.startDate,
        conversationModel.endDate
    )
    this.chartOptions.title.text = `Message Count by Month for ${conversationModel.displayName}`;
    this.chartOptions = Object.assign({}, this.chartOptions);
  }
}
