import { MessageFormatterService } from "../../core/services/fb-message-loader/message-formatter-service";
import { ChartOptions, TimeUnit } from "chart.js";
import { ConversationModel } from "../../core/models/conversation-model";
import { SingleDataSet } from "ng2-charts";
import { WordModel, ConversationModelConversions, WordModelConversions } from "../../core/models";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ThrowStmt } from "@angular/compiler";
import { GraphMessageProvider } from "../../core/services";

export class ChartControl {
    private _startDate: string;
    private _endDate: string;

    constructor(private _messageFormatterService: MessageFormatterService, 
                private _graphMessageProvider: GraphMessageProvider) {}

    public changeStartDate(startDate: NgbDateStruct) {
        this._graphMessageProvider.showTimeGraph(this.dateStructToDate(startDate),  this._endDate);
    }
    
    public changeEndDate(endDate: NgbDateStruct) {
        this._graphMessageProvider.showTimeGraph(this._startDate, this.dateStructToDate(endDate));
    }

    public dateStructToDate(date: NgbDateStruct): string {
        return new Date(`${date.month} ${date.day} ${date.year}`).toString();
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
