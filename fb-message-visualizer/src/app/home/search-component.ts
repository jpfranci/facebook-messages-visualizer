import { Component, ElementRef, ViewChild } from "@angular/core";
import { MessageProvider, MessageLoaderService } from "../core/services";
import { ConversationModel, WordModel, MessageModel } from "../core/models";
import { Observable } from "rxjs";
import { tap, map, take, debounceTime, distinctUntilChanged, filter, switchMap } from "rxjs/operators";
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import { ChartOptions } from 'chart.js';
import { SingleDataSet } from "ng2-charts";
import { MessageFormatterService } from "../core/services/fb-message-loader/message-formatter-service";
import { SearchControl } from "./control/search-control";

@Component({
    selector: 'search-component',
    templateUrl: './search-component.html',
    styleUrls: ['./search-component.scss']
  })
export class SearchComponent {
  @ViewChild(NgbTypeahead, {static: true}) 
  private _ngbTypeahead: NgbTypeahead;
  private _searchControl: SearchControl;

  constructor(
    private _messageProvider: MessageProvider, 
    private _messageLoaderService: MessageLoaderService,
    private _messageFormatterService: MessageFormatterService) {
      this._searchControl = new SearchControl(
        this._ngbTypeahead, 
        _messageLoaderService, 
        _messageProvider, 
        _messageFormatterService);
  }

  ngAfterViewInit() {
    this._searchControl.ngbTypeahead = this._ngbTypeahead;
  }
  
  _wordModelFormatter = (result: WordModel) => {
    const totalFrequency: number = this._messageLoaderService.getTotalFrequency(JSON.parse(result.frequencies));
    return `"${result.word}" has been used ${totalFrequency} times`;
  } 
  
  _inputFormatter = (item: any) => {
    if (item.word) {
      return item.word;
    } else {
      return item;
    }
  }
}