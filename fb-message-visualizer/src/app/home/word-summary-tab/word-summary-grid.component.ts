import {Component, HostListener, Input} from "@angular/core";
import {GraphMessageProvider, MessageLoaderService} from "../../core/services";
import {ConversationModel, ConversationModelConversions, WordModel} from "../../core/models";
import {AllCommunityModules, Module} from "@ag-grid-community/all-modules/dist/cjs/main";
import {BehaviorSubject, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {WordSummaryControl} from "../control/word-summary-control";

@Component({
  selector: 'word-summary-grid',
  templateUrl: './word-summary-grid.component.html',
  styleUrls: ['./word-summary-grid.component.scss']
})
export class WordSummaryGridComponent {
  @Input() control: WordSummaryControl;
  private static _phraseCol: {} = {
    headerName: "Phrase",
    filter: true,
    filterParams: {
      suppressAndOrCondition: true
    },
    valueGetter: function(data: any)  {
      const wordModel = data.data;
      if (data.data && wordModel.hasOwnProperty('word')) {
        return wordModel.word;
      } else {
        return "";
      }
    }
  };

  private _columnDefs: BehaviorSubject<Array<{}>>;
  private _modules: Array<Module>;
  private _totalCol: {};
  private _defaultColDef: {};
  private _destroyObservable: Subject<void>;

  constructor(private _graphMessageProvider: GraphMessageProvider,
              private _messageLoaderService: MessageLoaderService) {
    this._destroyObservable = new Subject<void>();
    this._columnDefs = new BehaviorSubject<Array<{}>>([]);
    this._totalCol = {
      headerName: "Total",
      valueGetter: (data: any) => {
        const wordModel = data.data;
        if (data.data && wordModel.frequencies) {
          return this._messageLoaderService.getTotalFrequency(JSON.parse(wordModel.frequencies));
        } else {
          return 0;
        }
      }
    };
    this._defaultColDef = {
      resizable: true,
      sortable: true,
      suppressSizeToFit: false
    };

    this._modules = AllCommunityModules;
  }

  ngAfterViewInit() {
    this._graphMessageProvider.currentConversation
      .pipe(
        takeUntil(this._destroyObservable)
      )
      .subscribe((conversationModel) => {
        if (conversationModel) {
          this._generateColumns(conversationModel);
          this.control.resizeGrid();
        }
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.control.resizeGrid();
  }

  ngOnDestroy() {
    this._destroyObservable.next();
    this._destroyObservable.complete();
  }

  onGridReady(params) {
    this.control.gridApi = params.api;
    this.control.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }

  private _generateColumns(conversationModel: ConversationModel) {
    let columnsToSave: Array<{}> = [];
    columnsToSave.push(WordSummaryGridComponent._phraseCol, this._totalCol);
    const participants = ConversationModelConversions.toParticipantsArray(conversationModel);
    this._sortParticipantsByTotal(participants, conversationModel);
    participants.forEach((participant: string) => {
      columnsToSave.push({
        headerName: participant,
        valueGetter: function(data: any) {
          const wordModel = data.data;
          if (data.data && wordModel.frequencies) {
            const frequencies = JSON.parse(wordModel.frequencies);
            if (frequencies.hasOwnProperty(participant)) {
              return frequencies[participant];
            } else {
              return 0;
            }
          } else {
            return 0;
          }
        }
      })
    });
    this._columnDefs.next(columnsToSave);
  }

  private _sortParticipantsByTotal(participants: Array<string>, conversationModel: ConversationModel): void {
    const datesObject = JSON.parse(conversationModel.dates);
    participants.sort((participantA: string, participantB: string) => {
      if (datesObject.hasOwnProperty(participantA) && datesObject.hasOwnProperty(participantB)) {
        return this._messageLoaderService.sumUpIndividualInDateObject(datesObject[participantB]) - this._messageLoaderService.sumUpIndividualInDateObject(datesObject[participantA]);
      } else if (datesObject.hasOwnProperty(participantA)) {
        return -1;
      } else {
        return 0;
      }
    })
  }
}
