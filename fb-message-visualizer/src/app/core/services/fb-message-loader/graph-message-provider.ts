import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ChartOptions, ChartType, TimeUnit } from "chart.js";
import { ConversationModel, WordModel, ConversationModelConversions, ChartGroupModel } from "../../models";
import { MessageProvider } from "./message-provider";
import { filter, take, map, tap } from "rxjs/operators";
import { MessageFormatterService } from "./message-formatter-service";
import { SingleDataSet } from "ng2-charts";

@Injectable({
    providedIn: 'root'
})
export class GraphMessageProvider {
    private _chartDataset: Array<{data: SingleDataSet, label: string}>;
    private _currentConversationObservable: BehaviorSubject<ConversationModel>;
    private _selectedToDisplayObservable: BehaviorSubject<ConversationModel | WordModel>;
    private _wordModelsObservable: BehaviorSubject<Array<WordModel>>;
    
    // Chart Options
    private _selectedParticipantsObservable: BehaviorSubject<Array<string>>;
    private _chartOptionsObservable: BehaviorSubject<ChartOptions>;
    private _chartTypeObservable: BehaviorSubject<ChartType>;
    private _useTotalObservable: BehaviorSubject<boolean>;
    private _groupModelObservable: BehaviorSubject<ChartGroupModel>;

    public static NOT_SEPARATED_NOR_STACKED: ChartGroupModel = {
        isSeparated: false,
        isStacked: false
    }

    public static SEPARATED_BUT_NOT_STACKED: ChartGroupModel = {
        isSeparated: true,
        isStacked: false
    }
    
    constructor(private _messageProvider: MessageProvider, 
                private _messageFormatterService: MessageFormatterService) {
        this._initSubjects();
        this._initConversationModel();
        this._messageProvider.availableConversations.pipe(
            filter((availableConversations: ConversationModel[]) => availableConversations.length > 0),
            take(1)
          )
          .subscribe((conversationModels: ConversationModel[]) => {
            const conversationModel = conversationModels[0];
            this._selectedToDisplayObservable.next(conversationModel); 
            this.showTimeGraph();
          })
    }

    
    private _initChartOptions(): ChartOptions {
        return {
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
                        maxTicksLimit: 10
                    }
                }],
                yAxes: [{
                    display: true,
                    position: 'left',
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }

    private _initSubjects(): void {
        this._chartDataset = [{data: [], label: ""}];
        this._chartOptionsObservable = new BehaviorSubject<ChartOptions>(this._initChartOptions());
        this._currentConversationObservable = new BehaviorSubject<ConversationModel>(undefined);
        this._selectedParticipantsObservable = new BehaviorSubject<Array<string>>([]);
        this._selectedToDisplayObservable = new BehaviorSubject<ConversationModel | WordModel>(undefined);
        this._wordModelsObservable = new BehaviorSubject<Array<WordModel>>([]);
        this._chartTypeObservable = new BehaviorSubject<ChartType>('line');
        this._groupModelObservable = new BehaviorSubject<ChartGroupModel>(GraphMessageProvider.NOT_SEPARATED_NOR_STACKED);
        this._useTotalObservable = new BehaviorSubject<boolean>(true);
    }

    public showTimeGraph(startDate?: string, endDate?: string): void {
        let participantsToUse: string[] = this._selectedParticipantsObservable.getValue();
        const model: ConversationModel | WordModel = this._selectedToDisplayObservable.getValue();
        let chartOptions: ChartOptions = this._chartOptionsObservable.getValue();
        const startDateToUse = startDate ? startDate: model.startDate;
        const endDateToUse = endDate ? endDate : model.endDate;
        let dataSetAndUnit;
        
        if (this._groupModelObservable.getValue().isSeparated) {
            dataSetAndUnit = this._messageFormatterService.getSeparatedDates(
                JSON.parse(model.dates),
                startDateToUse,
                endDateToUse,
                this._useTotalObservable.getValue(),
                chartOptions.scales.xAxes[0].ticks.maxTicksLimit,
                participantsToUse
            )
        } else {
            dataSetAndUnit = this._messageFormatterService.getTotalDates(
                JSON.parse(model.dates),
                startDateToUse,
                endDateToUse,
                this._useTotalObservable.getValue(),
                chartOptions.scales.xAxes[0].ticks.maxTicksLimit,
                participantsToUse
            )
        }
        this._chartDataset = dataSetAndUnit.dataset;
        if (model.hasOwnProperty("word")) {
            chartOptions.title.text = `Message Count of ${this.capitalizeFirstLetter((<WordModel>model).word)} by ${this.capitalizeFirstLetter(dataSetAndUnit.unit)} for Chat with ${model.displayName}`;
        } else {
            chartOptions.title.text = `Message Count by ${this.capitalizeFirstLetter(dataSetAndUnit.unit)} for Chat with ${model.displayName}`;
        }
        if (dataSetAndUnit.unit === 'quarter') {
            dataSetAndUnit.unit = 'month';
        }
        chartOptions.scales.xAxes[0].time.unit = <TimeUnit> dataSetAndUnit.unit;
        this._chartOptionsObservable.next(Object.assign({}, chartOptions));
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public get chartDataset(): Array<{data: SingleDataSet, label: string}> {
        return this._chartDataset;
    }

    public get chartOptions(): Observable<ChartOptions> {
        return this._chartOptionsObservable;
    }

    public get chartGroupModelObservable(): Observable<ChartGroupModel> {
        return this._groupModelObservable;
    }

    public set chartGroupModel(chartGroupModel: ChartGroupModel) {
        this._groupModelObservable.next(chartGroupModel);
        this.showTimeGraph();
    }

    public get useTotalObservable(): Observable<boolean> {
        return this._useTotalObservable;
    }

    public set useTotal(useTotal: boolean) {
        this._useTotalObservable.next(useTotal);
        this.showTimeGraph();
    }

    public get chartTypeObservable(): Observable<string> {
        return this._chartTypeObservable;
    }

    public get currentConversation(): Observable<ConversationModel> {
        return this._currentConversationObservable.pipe(
            filter(conversationModel => conversationModel !== undefined),
            take(1)
        );
    }

    public get selectedConversationNameObservable(): Observable<string> {
        return this._currentConversationObservable.pipe(
            filter((conversationModel: ConversationModel) => conversationModel !== undefined),
            map((conversationModel: ConversationModel) => conversationModel.displayName),
            take(1)
        );
    }

    public get participantsObservable(): Observable<Array<string>> {
        return this._currentConversationObservable.pipe(
            filter((conversationModel: ConversationModel) => conversationModel !== undefined),
            map((conversationModel: ConversationModel) => 
                ConversationModelConversions.toParticipantsArray(conversationModel)),
            take(1)
        )
    }

    public setSelectedParticipants(selectedParticipants: Array<string>): void {
        this._selectedParticipantsObservable.next(selectedParticipants);
        this.showTimeGraph();
    }

    public set chartType(chartType: ChartType) {
        this._chartTypeObservable.next(chartType);
        this.showTimeGraph();
    }

    private _initConversationModel(): void {
        this._messageProvider.availableConversations.pipe(
            filter((availableConversations: ConversationModel[]) => availableConversations.length > 0),
            take(1)
          )
          .subscribe((conversationModels: ConversationModel[]) => {
            const conversationModel = conversationModels[0];
            this.changeConversationModel(conversationModel);
        })
    }

    public changeConversationModel(conversationModel: ConversationModel): void {
        this._currentConversationObservable.next(conversationModel);
        this._selectedToDisplayObservable.next(conversationModel);
        this._selectedParticipantsObservable.next(ConversationModelConversions.toParticipantsArray(conversationModel));
        this._messageProvider.getWords(conversationModel.displayName, "").subscribe(
            (wordModels: Array<WordModel>) => {
                this._wordModelsObservable.next(wordModels);
        });
        this.showTimeGraph();
    }

    public changeWord(wordModel: WordModel): void {
        this._selectedToDisplayObservable.next(wordModel);
        this.showTimeGraph();
    }
}