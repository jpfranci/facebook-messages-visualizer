import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ChartOptions, ChartType, TimeUnit } from "chart.js";
import {
  ConversationModel,
  WordModel,
  ConversationModelConversions,
  ChartGroupModel,
  DateObjectModel, ReactionModel
} from "../../models";
import { MessageProvider } from "./message-provider";
import { filter, take, map, tap } from "rxjs/operators";
import { MessageFormatterService } from "./message-formatter-service";
import { SingleDataSet } from "ng2-charts";
import * as Chart from "chart.js";

@Injectable({
    providedIn: 'root'
})
export class GraphMessageProvider {
    private _chartDataset: Array<{data: SingleDataSet, label: string}>;
    private _currentConversationObservable: BehaviorSubject<ConversationModel>;
    private _selectedToDisplayObservable: BehaviorSubject<ConversationModel | WordModel | ReactionModel>;
    private _labelsObservable: BehaviorSubject<Array<string>>;
    private _dateModel: DateObjectModel;

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
      chartDataset: Array<{data: SingleDataSet, label: string}>,
      currentConversation: ConversationModel,
      selectedToDisplay: ConversationModel | WordModel | ReactionModel,
      selectedParticipants: Array<string>,
      chartOptions: ChartOptions,
      chartType: ChartType,
      useTotal: boolean,
      groupModel: ChartGroupModel,
      xAxisDisplay: string,
      showTimeOptions: boolean,
      labels: Array<string>
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
            this.showGraph();
          })
    }

    private _initTimeChartOptions(): ChartOptions {
        return {
            responsive: true,
            title: {
                display: true,
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

    private _initParticipantsChartOptions(): ChartOptions {
      return {
        responsive: true,
        title: {
          display: true,
          fontSize: 15
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: "category",
            distribution: "linear",
          }],
          yAxes: [{
            display: true,
            position: 'left',
            ticks: {
              beginAtZero: true
            }
          }]
        },
        // from https://github.com/jtblin/angular-chart.js/issues/605
        tooltips: {
          enabled: true
        },
        hover: {
          animationDuration: 1
        },
        animation: {
          duration: 1,
          onComplete: function () {
            const chartInstance = this.chart;
            const ctx = chartInstance.ctx;
            ctx.textAlign = 'center';
            ctx.font = Chart.helpers.fontString(12, 'normal', Chart.defaults.global.defaultFontFamily);
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.textBaseline = 'bottom';

            this.data.datasets.forEach(function (dataset, i) {
              const meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                const data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        }
      }
    }

    private _initSubjects(): void {
        this._chartDataset = [{data: [], label: ""}];
        this._labelsObservable = new BehaviorSubject<Array<string>>([]);
        this._chartOptionsObservable = new BehaviorSubject<ChartOptions>(this._initTimeChartOptions());
        this._currentConversationObservable = new BehaviorSubject<ConversationModel>(undefined);
        this._selectedParticipantsObservable = new BehaviorSubject<Array<string>>([]);
        this._selectedToDisplayObservable = new BehaviorSubject<ConversationModel | WordModel | ReactionModel>(undefined);
        this._chartTypeObservable = new BehaviorSubject<ChartType>('line');
        this._groupModelObservable = new BehaviorSubject<ChartGroupModel>(GraphMessageProvider.NOT_SEPARATED_NOR_STACKED);
        this._useTotalObservable = new BehaviorSubject<boolean>(true);
        this._startDate = new BehaviorSubject<Date>(new Date());
        this._endDate = new BehaviorSubject<Date>(new Date());
        this._xAxisDisplayObservable = new BehaviorSubject<string>(GraphMessageProvider.TIME_AXIS);
        this._showTimeOptionsObservable = new BehaviorSubject<boolean>(true);
        this._isTemporaryMode = false;
    }

    public showGraph(startDate?: string, endDate?: string): void {
        if (this._xAxisDisplayObservable.getValue() === GraphMessageProvider.TIME_AXIS) {
          this._showTimeGraph(startDate, endDate);
        } else {
          this._showParticipantGraph(startDate, endDate);
        }
    }

    private _showParticipantGraph(startDate?: string, endDate?: string): void {
      let participantsToUse: string[] = this._selectedParticipantsObservable.getValue();
      const dateModelAndDates = this._getModelAndDatesToUse(startDate, endDate);
      const chartOptions = this._chartOptionsObservable.getValue();
      const datasetMap = this._messageFormatterService.getDatasetForParticipants(
        JSON.parse(dateModelAndDates.dates),
          dateModelAndDates.startDate,
          dateModelAndDates.endDate,
          participantsToUse
      );
      this._setDatasetAndLabels(datasetMap);
      this._setHeader(chartOptions, dateModelAndDates);
      this._changeChartOptions(chartOptions);
    }

    private _setDatasetAndLabels(dataSetMap: Map<string, {data: SingleDataSet, label: string}>): void {
      let datasetToUse: SingleDataSet = [];
      let labelsToUse: Array<string> = [];
      Array.from(dataSetMap.entries()).forEach((participantAndData) => {
        const dataToPush = participantAndData[1].data;
        // @ts-ignore
        datasetToUse.push(...dataToPush);
        labelsToUse.push(participantAndData[0]);
      });
      this._chartDataset = [{data: datasetToUse, label: "Total"}];
      this._labelsObservable.next(labelsToUse);
    }

    private _showTimeGraph(startDate?: string, endDate?: string): void  {
      let participantsToUse: string[] = this._selectedParticipantsObservable.getValue();
      const dateModelAndDates = this._getModelAndDatesToUse(startDate, endDate);
      const chartOptions = this._chartOptionsObservable.getValue();
      let dataSetAndUnit;

      if (this._groupModelObservable.getValue().isSeparated) {
        dataSetAndUnit = this._messageFormatterService.getSeparatedDates(
          JSON.parse(dateModelAndDates.dates),
          dateModelAndDates.startDate,
          dateModelAndDates.endDate,
          this._useTotalObservable.getValue(),
          chartOptions.scales.xAxes[0].ticks.maxTicksLimit,
          participantsToUse
        )
      } else {
        dataSetAndUnit = this._messageFormatterService.getTotalDates(
          JSON.parse(dateModelAndDates.dates),
          dateModelAndDates.startDate,
          dateModelAndDates.endDate,
          this._useTotalObservable.getValue(),
          chartOptions.scales.xAxes[0].ticks.maxTicksLimit,
          participantsToUse
        )
      }
      this._chartDataset = dataSetAndUnit.dataset;
      this._setHeader(chartOptions, dateModelAndDates, dataSetAndUnit.unit);
      chartOptions.scales.xAxes[0].time.unit = <TimeUnit> dataSetAndUnit.unit;
      this._changeChartOptions(chartOptions);
    }

    private _changeChartOptions(chartOptions: ChartOptions): void {
      this._chartOptionsObservable.next(Object.assign({}, chartOptions));
    }

    private _setHeader(chartOptions: ChartOptions,
                       dateModelAndDates: {dates: string, model: any, startDate: string, endDate: string, header: string},
                       timeUnit?: string): void {
      const conversationModel = this._currentConversationObservable.getValue();
      const startText = this._useTotalObservable.getValue() ? "Total" : "";
      const unitToUse = timeUnit ? timeUnit : "Participants";
      if (dateModelAndDates.model && dateModelAndDates.model.hasOwnProperty("word")) {
        chartOptions.title.text = `${startText} ${dateModelAndDates.header} Count of ${this.capitalizeFirstLetter((<WordModel>dateModelAndDates.model).word)} by ${this.capitalizeFirstLetter(unitToUse)} for Chat with ${conversationModel.displayName}`;
      } else if (dateModelAndDates.model && dateModelAndDates.model.hasOwnProperty('reaction')) {
        chartOptions.title.text = `${startText} ${dateModelAndDates.header} Count of ${this.capitalizeFirstLetter((<ReactionModel>dateModelAndDates.model).reaction)} by ${this.capitalizeFirstLetter(unitToUse)} for Chat with ${conversationModel.displayName}`;
      } else {
      chartOptions.title.text = `${startText} ${dateModelAndDates.header} Count by ${this.capitalizeFirstLetter(unitToUse)} for Chat with ${conversationModel.displayName}`;
      }
    }

    private _getModelAndDatesToUse(startDate?: string, endDate?: string):
      {dates: string, model: any, startDate: string, endDate: string, header: string} {
      let dates;
      let modelToUse;
      let startDateToUse;
      let endDateToUse;
      let header;
      if (this._dateModel) {
        dates = this._dateModel.dates;
        header = this._dateModel.type;
        startDateToUse = startDate ? startDate: this._startDate.getValue();
        endDateToUse = endDate ? endDate : this._endDate.getValue();
      } else {
        modelToUse = this._selectedToDisplayObservable.getValue();
        dates = this._selectedToDisplayObservable.getValue().dates;
        header = "Message";
        startDateToUse = startDate ? startDate: modelToUse.startDate;
        endDateToUse = endDate ? endDate : modelToUse.endDate;
      }
      return {
        dates: dates,
        model: modelToUse,
        startDate: startDateToUse,
        endDate: endDateToUse,
        header: header
      }
    }

    public get showTimeOptionsObservable(): Observable<boolean> {
      return this._showTimeOptionsObservable;
    }

    public get xAxisObservable(): Observable<string> {
      return this._xAxisDisplayObservable;
    }

    public changeXAxis(xAxis: string): void {
      this._xAxisDisplayObservable.next(xAxis);
      if (xAxis === GraphMessageProvider.TIME_AXIS) {
        this._chartOptionsObservable.next(this._initTimeChartOptions());
        this._labelsObservable.next([]);
        this._showTimeOptionsObservable.next(true);
      } else {
        this._groupModelObservable.next(GraphMessageProvider.SEPARATED_BUT_NOT_STACKED);
        this._chartTypeObservable.next('bar');
        this._chartOptionsObservable.next(this._initParticipantsChartOptions());
        this._showTimeOptionsObservable.next(false);
      }
      this.showGraph();
    }


  public set isTemporaryMode(isTemporaryMode){
      if (isTemporaryMode) {
        this._cacheSettings();
      } else {
        this._loadCachedSettings();
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
        groupModel: this._groupModelObservable.getValue(),
        xAxisDisplay: this._xAxisDisplayObservable.getValue(),
        showTimeOptions: this._showTimeOptionsObservable.getValue(),
        labels: this._labelsObservable.getValue()
      }
    }

    private _loadCachedSettings(): void {
      if (this._cachedSettings !== undefined) {
        this._chartDataset = this._cachedSettings.chartDataset;
        this._currentConversationObservable.next(this._cachedSettings.currentConversation);
        this._selectedToDisplayObservable.next(this._cachedSettings.selectedToDisplay);
        this._selectedParticipantsObservable.next(this._cachedSettings.selectedParticipants);
        this._chartOptionsObservable.next(this._cachedSettings.chartOptions);
        this._chartTypeObservable.next(this._cachedSettings.chartType);
        this._useTotalObservable.next(this._cachedSettings.useTotal);
        this._groupModelObservable.next(this._cachedSettings.groupModel);
        this._xAxisDisplayObservable.next(this._cachedSettings.xAxisDisplay);
        this._showTimeOptionsObservable.next(this._cachedSettings.showTimeOptions);
        this._labelsObservable.next(this._cachedSettings.labels);
        this._cachedSettings = undefined;
        this._resetDateModel();
        this.showGraph();
      }
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
        this.showGraph();
    }

    public get useTotalObservable(): Observable<boolean> {
        return this._useTotalObservable;
    }

    public set useTotal(useTotal: boolean) {
        this._useTotalObservable.next(useTotal);
        this.showGraph();
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
        this.showGraph();
    }

    public set chartType(chartType: ChartType) {
        this._chartTypeObservable.next(chartType);
        this.showGraph();
    }

    public get labelsObservable() {
      return this._labelsObservable;
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
        this.showGraph();
    }

    public changeDateModel(dateModel: DateObjectModel): void {
      const dates = this._getStartAndEndDateFromDateObject(dateModel.dates);
      this._startDate.next(new Date(dates.startDate));
      this._endDate.next(new Date(dates.endDate));
      this._dateModel = dateModel;
      this.showGraph();
    }

    public changeReactionModel(reactionModel: ReactionModel): void {
      this._resetDateModel();
      this._startDate.next(new Date(reactionModel.startDate));
      this._endDate.next(new Date(reactionModel.endDate));
      this._selectedToDisplayObservable.next(reactionModel);
      this.showGraph();
    }

    private _resetDateModel(): void {
      this._dateModel = undefined;
    }

    public changeWord(wordModel: WordModel): void {
        this._selectedToDisplayObservable.next(wordModel);
        this._startDate.next(new Date(wordModel.startDate));
        this._endDate.next(new Date(wordModel.endDate));
        this.showGraph();
    }

    private _getStartAndEndDateFromDateObject(dateObject: string): {startDate: string, endDate: string} {
      const parsedDateObject = JSON.parse(dateObject);
      const participants = Object.keys(parsedDateObject);
      let allDates: Set<number> = new Set();
      const allDatesArray: Array<number> = [];
      participants.forEach((participant) => {
        const dates = Object.keys(parsedDateObject[participant]);
        dates.forEach((date) => allDatesArray.push(new Date(date).getTime()));
      });
      return {
        startDate: allDatesArray.length > 0 ? new Date(Math.min(...allDatesArray)).toString() : Date.now().toString(),
        endDate: allDatesArray.length > 0 ? new Date(Math.max(...allDatesArray)).toString() : Date.now().toString()
      };
    }
}
