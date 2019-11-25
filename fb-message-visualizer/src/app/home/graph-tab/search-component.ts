import { Component, ViewChild } from "@angular/core";
import { MessageProvider, MessageLoaderService, GraphMessageProvider } from "../../core/services";
import { WordModel } from "../../core/models";
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import { MessageFormatterService } from "../../core/services/fb-message-loader/message-formatter-service";
import { SearchControl } from "../control/search-control";
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'search-component',
    templateUrl: './search-component.html',
    styleUrls: ['./search-component.scss']
  })
export class SearchComponent {
  @ViewChild(NgbTypeahead, {static: true})
  private _ngbTypeahead: NgbTypeahead;
  public _searchControl: SearchControl;
  private _modalRef: BsModalRef;

  constructor(
    private _messageProvider: MessageProvider,
    private _messageLoaderService: MessageLoaderService,
    public _graphMessageProvider: GraphMessageProvider,
    public _messageFormatterService: MessageFormatterService,
    private _modalService: BsModalService) {
      this._searchControl = new SearchControl(
        this._ngbTypeahead,
        _messageLoaderService,
        _messageProvider,
        _graphMessageProvider);
  }

  public openModal(template) {
    this._modalRef = this._modalService.show(template);
  }

  ngAfterViewInit() {
    this._searchControl.ngbTypeahead = this._ngbTypeahead;
  }

  _wordModelFormatter = (result: WordModel) => {
    const totalFrequency: number = this._messageLoaderService.getTotalFrequency(JSON.parse(result.frequencies));
    return `"${result.word}" has been used ${totalFrequency} times`;
  };

  _inputFormatter = (item: any) => {
    if (item.word) {
      return item.word;
    } else {
      return item;
    }
  }
}
