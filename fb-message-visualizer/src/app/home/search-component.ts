import { Component, ElementRef, ViewChild } from "@angular/core";
import { MessageProvider, MessageLoaderService } from "../core/services";
import { ConversationModel, WordModel, MessageModel } from "../core/models";
import { Observable } from "rxjs";
import { tap, map, mergeMap, take, debounceTime, distinctUntilChanged, filter, switchMap } from "rxjs/operators";
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownConfig, BsDropdownContainerComponent } from 'ngx-bootstrap/dropdown';

@Component({
    selector: 'search-component',
    templateUrl: './search-component.html',
    styleUrls: ['./search-component.scss']
  })
export class SearchComponent {
  @ViewChild(NgbTypeahead, {static: true}) 
  private _ngbTypeahead: NgbTypeahead;
  private _inputText: string;
  private _selectedConversation: ConversationModel;
  private _wordLengthFilter: string;
  private _dataSource: Observable<any>;
  private selected: string;
  private _wordOptions: Observable<Array<WordModel>>;
  private _toWordFilterOption: number;
  private _fromWordFilterOption: number;
  constructor(private _messageProvider: MessageProvider, private _messageLoaderService: MessageLoaderService) {
      this._inputText = "You must pick a conversation to analyze before you begin";
      this._wordLengthFilter = "Number of words filter"
      this._messageProvider.inMemorySubject.subscribe((wordModels: Array<WordModel>) => {
        if (wordModels.length > 0 && this._inputText === wordModels[0].displayName) {
          this._wordOptions = this._messageProvider.inMemorySubject;
        }
      })
  }

  _onType = (searchTerm: Observable<string>): Observable<Array<WordModel>> => {
    return searchTerm.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap((term: string) => {
        if (term.length <= 1) {
          this._ngbTypeahead.dismissPopup()
        }
      }),
      filter(term => term.length > 1 && this._wordOptions !== undefined),
      switchMap(term => this._wordOptions.pipe(
        map((wordModels) => {
          const query = new RegExp(term, 'i');
          const fromFilterCondition: number = this._fromWordFilterOption && Number(this._fromWordFilterOption) ? 
            Number(this._fromWordFilterOption) : 0;
          const toFilterCondition: number = this._toWordFilterOption && Number(this._toWordFilterOption) ?
            Number(this._toWordFilterOption) : this._selectedConversation.nGrams;
          const filtered = wordModels.filter((wordModel: WordModel) => {
            const wordLength = wordModel.word.split(' ').length;
            return wordLength >= fromFilterCondition && 
              wordLength <= toFilterCondition && 
              query.test(wordModel.word)
          });
          return filtered.slice(0, 10);
        })
      ))
    )
  }
  
  _wordModelFormatter = (result: WordModel) => {
    const totalFrequency: number = this._messageLoaderService.getTotalFrequency(JSON.parse(result.frequencies));
    return `"${result.word}" has been used ${totalFrequency} times`;
  } 

  private _getToFilterWordPlaceholder(): string {
    if (this._selectedConversation) {
      return this._selectedConversation.nGrams.toString();
    } else {
      return MessageLoaderService.DEFAULTNGRAMS.toString();
    }
  }
  
  _inputFormatter = (item: any) => {
    if (item.word) {
      return item.word;
    } else {
      return item;
    }
  }

  onConversationSelect(conversationModel: ConversationModel): void {
    this._inputText = conversationModel.displayName;
    this._selectedConversation = conversationModel;
    this._wordOptions = this._messageProvider.getWords(conversationModel.displayName, "");
  }
}