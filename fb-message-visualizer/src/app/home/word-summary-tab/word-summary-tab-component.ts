import {Component} from "@angular/core";
import {MessageProvider} from "../../core/services";

@Component({
  selector: 'word-summary-tab',
  templateUrl: './word-summary-tab-component.html',
  styleUrls: ['./word-summary-tab-component.scss']
})
export class WordSummaryTabComponent {
  constructor(private _messageProvider: MessageProvider) {

  }
}
