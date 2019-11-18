import {NgbTypeahead, NgbTypeaheadSelectItemEvent} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { WordModel, ConversationModel, ConversationModelConversions, ChartGroupModel } from '../../core/models';
import { debounceTime, distinctUntilChanged, tap, filter, switchMap, map, take } from 'rxjs/operators';
import { MessageLoaderService, MessageProvider, GraphMessageProvider } from '../../core/services';
import { MessageFormatterService } from '../../core/services/fb-message-loader/message-formatter-service';
import { SingleDataSet } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { ChartTypeFilterComponent } from '../chart-type-filter-component';
import { GroupFilterComponent } from '../group-filter-component';

export class SearchControl {
    public fromWordFilterOption: string;
    public toWordFilterOption: string;
    public selectedConversationInput: string;
    public selectedWord: string;
    
    public rawDataset: ConversationModel | WordModel;
    public dataset: Array<{data: SingleDataSet, label: string}>;
    public chartOptions: ChartOptions;
    public chartType: string;
    public participants: Array<string>; 
    public usedParticipants: Array<string>;
    public chartGroupModel: ChartGroupModel;
    public isTotal: boolean;

    private _wordModels: Observable<Array<WordModel>>;
    private _selectedConversation: ConversationModel;

    constructor(private _ngbTypeahead: NgbTypeahead,
                private _messageLoaderService: MessageLoaderService,
                private _messageProvider: MessageProvider,
                private _messageFormatterService: MessageFormatterService) {
      this.selectedConversationInput = "You must pick a conversation to analyze before you begin";
      this.participants = [];
      this.chartGroupModel = GraphMessageProvider.NOT_SEPARATED_NOR_STACKED;
      this.chartType = 'line';
      this.isTotal = true;
      this._initConversationModel();
      
      this._messageProvider.inMemorySubject.subscribe((wordModels: Array<WordModel>) => {
        if (wordModels.length > 0 && this.selectedConversationInput === wordModels[0].displayName) {
          this._wordModels = this._messageProvider.inMemorySubject;
        }
      })
    }

    public set ngbTypeahead(ngbTypeahead: NgbTypeahead) {
      this._ngbTypeahead = ngbTypeahead;
    }
   
    private _initConversationModel() {
      this._messageProvider.availableConversations.pipe(
        filter((availableConversations: ConversationModel[]) => availableConversations.length > 0),
        take(1)
      )
      .subscribe((conversationModels: ConversationModel[]) => {
        const conversationModel = conversationModels[0];
        this.onConversationSelect(conversationModel);
      })
    }

    public getToFilterWordPlaceholder(): string {
      if (this._selectedConversation) {
        return this._selectedConversation.nGrams.toString();
      } else {
        return MessageLoaderService.DEFAULTNGRAMS.toString();
      }
    }

    public changeUsedParticipants(newParticipantsToUse: Array<string>): void {
      this.usedParticipants = newParticipantsToUse.slice();
    }
    
    public onSelectWord(selectedItem: NgbTypeaheadSelectItemEvent): void {
      this.rawDataset = selectedItem.item;
    }

    onType = (searchTerm: Observable<string>): Observable<Array<WordModel>> => {
    return searchTerm.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap((term: string) => {
        if (term.length <= 1) {
          this._ngbTypeahead.dismissPopup()
        }
      }),
      filter(term => term.length > 1 && this._wordModels !== undefined),
      switchMap(term => this._wordModels.pipe(
        map((wordModels) => {
          let query;
          try {
            query = new RegExp(term, 'i');
          } catch { 
            return [];
          }
          const fromFilterCondition: number = this.fromWordFilterOption && Number(this.fromWordFilterOption) ? 
            Number(this.fromWordFilterOption) : 0;
          const toFilterCondition: number = this.toWordFilterOption && Number(this.toWordFilterOption) ?
            Number(this.toWordFilterOption) : this._selectedConversation.nGrams;
          const filtered = wordModels.filter((wordModel: WordModel) => {
            const wordLength = wordModel.word.split(' ').length;
            return wordLength >= fromFilterCondition && 
              wordLength <= toFilterCondition && 
              query.test(wordModel.word)
          });
          return filtered.slice(0, 10);
        })
      ))
    );
  }

  public onConversationSelect(conversationModel: ConversationModel): void {
    this.selectedConversationInput = conversationModel.displayName;
    this.usedParticipants = ConversationModelConversions.toParticipantsArray(conversationModel);
    this.participants = ConversationModelConversions.toParticipantsArray(conversationModel);
    this._selectedConversation = conversationModel;
    this.rawDataset = conversationModel;
    this._wordModels = this._messageProvider.getWords(conversationModel.displayName, "");
  }
}