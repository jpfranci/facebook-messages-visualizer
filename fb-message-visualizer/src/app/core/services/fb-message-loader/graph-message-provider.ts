import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ChartOptions, ChartType, TimeUnit } from "chart.js";
import { ConversationModel, WordModel, ConversationModelConversions, ChartGroupModel } from "../../models";
import { MessageProvider } from "./message-provider";
import { filter, take, map, tap } from "rxjs/operators";
import { MessageFormatterService } from "./message-formatter-service";
import { SingleDataSet } from "ng2-charts";
import {XAxisSelectionComponent} from "../../../home/graph-tab/x-axis-selection-component";

@Injectable({
    providedIn: 'root'
})
export class GraphMessageProvider {
    private _chartDataset: Array<{data: SingleDataSet, label: string}>;
    private _currentConversationObservable: BehaviorSubject<ConversationModel>;
    private _selectedToDisplayObservable: BehaviorSubject<ConversationModel | WordModel>;

    // Chart Options
    private _selectedParticipantsObservable: BehaviorSubject<Array<string>>;
    private _chartOptionsObservable: BehaviorSubject<ChartOptions>;
    private _chartTypeObservable: BehaviorSubject<ChartType>;
    private _useTotalObservable: BehaviorSubject<boolean>;
    private _groupModelObservable: BehaviorSubject<ChartGroupModel>;
    private _xAxisDisplayObservable: BehaviorSubject<string>;
    private _showTimeOptionsObservable: BehaviorSubject<boolean>;

    private _startDate: BehaviorSubject<Date>;
    private _endDate: BehaviorSubject<Date>;

    private _isTemporaryMode: boolean;
    private _cachedSettings: {
      chartDataset: any,
      currentConversation: any,
      selectedToDisplay: any,
      selectedParticipants: any,
      chartOptions: any,
      chartType: any,
      useTotal: any,
      groupModel: any
    };

    public static NOT_SEPARATED_NOR_STACKED: ChartGroupModel = {
        isSeparated: false,
        isStacked: false
    };

    public static SEPARATED_BUT_NOT_STACKED: ChartGroupModel = {
        isSeparated: true,
        isStacked: false
    };

    public static TIME_AXIS = "Show Time in the Horizontal Axis";
    public static PARTICIPANTS_AXIS = "Show Participants in the Horizontal Axis";

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
        this._chartTypeObservable = new BehaviorSubject<ChartType>('line');
        this._groupModelObservable = new BehaviorSubject<ChartGroupModel>(GraphMessageProvider.NOT_SEPARATED_NOR_STACKED);
        this._useTotalObservable = new BehaviorSubject<boolean>(true);
        this._startDate = new BehaviorSubject<Date>(new Date());
        this._endDate = new BehaviorSubject<Date>(new Date());
        this._xAxisDisplayObservable = new BehaviorSubject<string>(XAxisSelectionComponent.TIME_AXIS);
        this._showTimeOptionsObservable = new BehaviorSubject<boolean>(true);
        this._isTemporaryMode = false;
    }

    public get showTimeOptionsObservable(): Observable<boolean> {
      return this._showTimeOptionsObservable;
    }

    public get xAxisObservable(): Observable<string> {
      return this._xAxisDisplayObservable;
    }

    public changeXAxis(xAxis: string): void {
      this._xAxisDisplayObservable.next(xAxis)
      if (xAxis === GraphMessageProvider.TIME_AXIS) {
        this._showTimeOptionsObservable.next(true);
      } else {
        this._groupModelObservable.next(GraphMessageProvider.PARTICIPANTS_AXIS);
        this._chartTypeObservable.next('bar');
        this._showTimeOptionsObservable.next(false);
      }
      this.showTimeGraph();
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
        const startText = this._useTotalObservable.getValue() ? "Total" : "";
        if (model.hasOwnProperty("word")) {
            chartOptions.title.text = `${startText} Message Count of ${this.capitalizeFirstLetter((<WordModel>model).word)} by ${this.capitalizeFirstLetter(dataSetAndUnit.unit)} for Chat with ${model.displayName}`;
        } else {
            chartOptions.title.text = `${startText} Message Count by ${this.capitalizeFirstLetter(dataSetAndUnit.unit)} for Chat with ${model.displayName}`;
        }
        if (dataSetAndUnit.unit === 'quarter') {
            dataSetAndUnit.unit = 'month';
        }
        chartOptions.scales.xAxes[0].time.unit = <TimeUnit> dataSetAndUnit.unit;
        this._chartOptionsObservable.next(Object.assign({}, chartOptions));
    }

    public set isTemporaryMode(isTemporaryMode){
      if (this._isTemporaryMode !== isTemporaryMode) {
        if (isTemporaryMode) {
          this._cacheSettings();
        } else {
          this._loadCachedSettings();
        }
      }
    }

    private _cacheSettings(): void {
      this._cachedSettings = {
        chartDataset: this._chartDataset,
        currentConversation: this._currentConversationObservable.getValue(),
        selectedToDisplay: this._selectedToDisplayObservable.getValue(),
        selectedParticipants: this._selectedParticipantsObservable.getValue(),
        chartOptions: this._chartOptionsObservable.getValue(),
        chartType: this._chartTypeObservable.getValue(),
        useTotal: this._useTotalObservable.getValue(),
        groupModel: this._groupModelObservable.getValue()
      }
    }

    private _loadCachedSettings(): void {
      this._chartDataset = this._cachedSettings.chartDataset;
      this._currentConversationObservable.next(this._cachedSettings.currentConversation);
      this._selectedToDisplayObservable.next(this._cachedSettings.selectedToDisplay);
      this._selectedParticipantsObservable.next(this._cachedSettings.selectedParticipants);
      this._chartOptionsObservable.next(this._cachedSettings.chartOptions);
      this._chartTypeObservable.next(this._cachedSettings.chartType);
      this._useTotalObservable.next(this._cachedSettings.useTotal);
      this._groupModelObservable.next(this._cachedSettings.groupModel);
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public get startDate(): Observable<Date> {
        return this._startDate;
    }

    public get endDate(): Observable<Date> {
        return this._endDate;
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
            filter(conversationModel => conversationModel !== undefined)
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
        this._startDate.next(new Date(conversationModel.startDate));
        this._endDate.next(new Date(conversationModel.endDate));
        this._selectedToDisplayObservable.next(conversationModel);
        this._selectedParticipantsObservable.next(ConversationModelConversions.toParticipantsArray(conversationModel));
    }


    public changeWord(wordModel: WordModel): void {
        this._selectedToDisplayObservable.next(wordModel);
        this._startDate.next(new Date(wordModel.startDate));
        this._endDate.next(new Date(wordModel.endDate));
        this.showTimeGraph();
    }

    private _getStartAndEndDateFromDateObject(dateObject: string): {startDate: string, endDate: string} {
      const participants = Object.keys(JSON.parse(dateObject));
      let allDates: Set<string> = new Set();
      participants.forEach((participant) => {
        const dates = Object.keys(dateObject[participant]);
        dates.forEach((date) => allDates.add(date));
      });
      const sortedDates: Array<string> = Array.from(allDates).sort(
        (a: string, b: string) => new Date(a).getMilliseconds() - new Date(b).getMilliseconds());
      return {
        startDate: sortedDates.length > 0 ? sortedDates[0] : Date.now().toString(),
        endDate: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : Date.now().toString()
      };
    }
}
