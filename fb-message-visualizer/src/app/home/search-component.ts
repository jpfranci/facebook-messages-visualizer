import { Component, ElementRef, ViewChild } from "@angular/core";
import { MessageProvider, MessageLoaderService } from "../core/services";
import { ConversationModel, WordModel, MessageModel } from "../core/models";
import { Observable } from "rxjs";
import { tap, map, mergeMap, take, debounceTime, distinctUntilChanged, filter, switchMap } from "rxjs/operators";
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownConfig, BsDropdownContainerComponent } from 'ngx-bootstrap/dropdown';
import { ChartPoint, ChartOptions } from 'chart.js';
import { SingleDataSet } from "ng2-charts";

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
  private _dataset: Array<{data: SingleDataSet, label: string}>;
  private _chartType: string;
  private _fromWordFilterOption: number;
  private _chartOptions: ChartOptions; 
  constructor(private _messageProvider: MessageProvider, private _messageLoaderService: MessageLoaderService) {
      this._inputText = "You must pick a conversation to analyze before you begin";
      this._wordLengthFilter = "Number of words filter"
      this._dataset = [{data: [], label: ""}];
      this._chartType = "line";
      this._chartOptions = {
        responsive: true,
        title: {
          display: true,
          text: "Total Message Count by Month"
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
          }]
        }
      }
      this._messageProvider.hasDataSubject.pipe(
        filter((hasDataSubject) => hasDataSubject),
        switchMap(() => this._messageProvider.getConversationModel("Universal studios")))
      .subscribe((conversationModel: ConversationModel) => {
        console.log(conversationModel);
        this.onConversationSelect(conversationModel);
        const dates = JSON.parse(conversationModel.dates);
        this._dataset = this._getTotalDates(dates, conversationModel.totalMessages);
      })
        
      this._messageProvider.inMemorySubject.subscribe((wordModels: Array<WordModel>) => {
        if (wordModels.length > 0 && this._inputText === wordModels[0].displayName) {
          this._wordOptions = this._messageProvider.inMemorySubject;
        }
      })
  }

  private _getTotalDates(dates: {}, total: number): Array<{data: SingleDataSet, label: string}> {
    const names: Array<string> = Object.keys(dates);
    const dateMap: Map<string, number> = new Map();
    names.forEach((name: string) => {
      const datesUsed: Array<string> = Object.keys(dates[name]);
      datesUsed.forEach((dateUsed : string) => {
        let numberOfTimesUsed: number = dateMap.get(dateUsed);
        numberOfTimesUsed = numberOfTimesUsed ? numberOfTimesUsed : 0;
        dateMap.set(dateUsed, numberOfTimesUsed + dates[name][dateUsed]);
      }); 
    });

    const totalDates: Array<ChartPoint> = [];
    let keys = Array.from(dateMap.keys());
    keys.sort((a, b) => {
      let dateA = new Date(a);
      let dateB = new Date(b);
      if (dateA.getTime() < dateB.getTime()) {
        return 1;
      } else if (dateA.getTime() > dateB.getTime()) {
        return -1;
      } else {
        return 0;
      }
    });
    let prev = total;
    keys.forEach((date: string) => {
      const numberOfTimesUsed = dateMap.get(date)
      totalDates.push({
        t: new Date(date),
        y: prev - numberOfTimesUsed
      })
      prev -= numberOfTimesUsed;
    })
    return [{data: totalDates, label: 'total'}];
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