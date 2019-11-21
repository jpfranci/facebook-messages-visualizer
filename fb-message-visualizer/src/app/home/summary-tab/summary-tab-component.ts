import { Component } from "@angular/core";
import { MessageProvider } from "../../core/services";

@Component({
    selector: 'summary-tab',
    templateUrl: './summary-tab-component.html',
    styleUrls: ['./summary-tab-component.scss']
  })
export class SummaryTabComponent {
    constructor(private _messageProvider: MessageProvider) {

    }
}