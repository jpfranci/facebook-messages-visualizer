import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ChartOptions, ChartType } from "chart.js";
import { ConversationModel, WordModel, ConversationModelConversions, ChartGroupModel } from "../../models";
import { MessageProvider } from "./message-provider";
import { filter, take, map, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class GraphMessageProvider {
    private _chartOptionsObservable: BehaviorSubject<ChartOptions>;
    private _currentConversationObservable: BehaviorSubject<ConversationModel>;
    private _selectedParticipantsObservable: BehaviorSubject<Array<string>>;
    private _selectedToDisplayObservable: BehaviorSubject<ConversationModel | WordModel>;
    private _wordModelsObservable: BehaviorSubject<Array<WordModel>>;
    private _selectedChartGroupObservable: BehaviorSubject<ChartGroupModel>;
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
    
    constructor(private _messageProvider: MessageProvider) {
        this._initSubjects();
        this._initConversationModel();
    }

    private _initSubjects(): void {
        this._chartOptionsObservable = new BehaviorSubject<ChartOptions>(this._initChartOptions());
        this._currentConversationObservable = new BehaviorSubject<ConversationModel>(undefined);
        this._selectedParticipantsObservable = new BehaviorSubject<Array<string>>([]);
        this._selectedToDisplayObservable = new BehaviorSubject<ConversationModel | WordModel>(undefined);
        this._wordModelsObservable = new BehaviorSubject<Array<WordModel>>([]);
        this._selectedChartGroupObservable = new BehaviorSubject<ChartGroupModel>(GraphMessageProvider.NOT_SEPARATED_NOR_STACKED);
        this._chartTypeObservable = new BehaviorSubject<ChartType>('line');
        this._groupModelObservable = new BehaviorSubject<ChartGroupModel>(GraphMessageProvider.NOT_SEPARATED_NOR_STACKED);
        this._useTotalObservable = new BehaviorSubject<boolean>(true);
    }

    public get chartGroupModelObservable(): Observable<ChartGroupModel> {
        return this._groupModelObservable;
    }

    public set chartGroupModel(chartGroupModel: ChartGroupModel) {
        this._groupModelObservable.next(chartGroupModel);
    }

    public get chartTypeObservable(): Observable<string> {
        return this._chartTypeObservable;
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
    }

    public set chartType(chartType: ChartType) {
        this._chartTypeObservable.next(chartType);
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
}