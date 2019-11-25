import { Component } from "@angular/core";
import {GraphMessageProvider, MessageProvider} from "../../core/services";
import {SummaryControl} from "../control/summary-control";


@Component({
    selector: 'summary-tab',
    templateUrl: './summary-tab-component.html',
    styleUrls: ['./summary-tab-component.scss']
  })
export class SummaryTabComponent {
  public _control: SummaryControl;
  constructor(public _messageProvider: MessageProvider,
              private _graphMessageProvider: GraphMessageProvider) {
    this._control = new SummaryControl(_graphMessageProvider, _messageProvider);
  }
}
