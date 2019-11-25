import {Component} from "@angular/core";
import {GraphMessageProvider, SaveDataService} from "../../core/services";
import {WordSummaryControl} from "../control/word-summary-control";

@Component({
  selector: 'word-summary-tab',
  templateUrl: './word-summary-tab-component.html',
  styleUrls: ['./word-summary-tab-component.scss']
})
export class WordSummaryTabComponent {
  private _control: WordSummaryControl;
  constructor(private _graphMessageProvider: GraphMessageProvider,
              saveDataService: SaveDataService) {
    this._control = new WordSummaryControl(_graphMessageProvider, saveDataService);
    _graphMessageProvider.isTemporaryMode = true;
  }

  ngOnDestroy() {
    this._graphMessageProvider.isTemporaryMode = false;
  }
}
