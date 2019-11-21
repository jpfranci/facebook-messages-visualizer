import {  NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { WordModel, ConversationModel } from '../../core/models';
import { debounceTime, distinctUntilChanged, tap, filter, switchMap, map, take } from 'rxjs/operators';
import { MessageLoaderService, MessageProvider, GraphMessageProvider } from '../../core/services';

export class SearchControl {
    public fromWordFilterOption: string;
    public toWordFilterOption: string;
    public selectedConversationInput: string;
    public selectedWord: string;

    private _wordModels: Observable<Array<WordModel>>;
    private _selectedConversation: ConversationModel;

    constructor(private _ngbTypeahead: NgbTypeahead,
                private _messageLoaderService: MessageLoaderService,
                private _messageProvider: MessageProvider,
                private _graphMessageProvider: GraphMessageProvider) {
      this.selectedConversationInput = "You must pick a conversation to analyze before you begin";
      
      this._messageProvider.inMemorySubject.subscribe((wordModels: Array<WordModel>) => {
        if (wordModels.length > 0 && this.selectedConversationInput === wordModels[0].displayName) {
          this._wordModels = this._messageProvider.inMemorySubject;
        }
      })
      
      this._graphMessageProvider.currentConversation.subscribe((conversationModel: ConversationModel) => {
        this._wordModels = this._messageProvider.getWords(conversationModel.displayName, "");
        this._selectedConversation = conversationModel;
      })
    }

    public set ngbTypeahead(ngbTypeahead: NgbTypeahead) {
      this._ngbTypeahead = ngbTypeahead;
    }

    public getToFilterWordPlaceholder(): string {
      if (this._selectedConversation) {
        return this._selectedConversation.nGrams.toString();
      } else {
        return MessageLoaderService.DEFAULTNGRAMS.toString();
      }
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
}