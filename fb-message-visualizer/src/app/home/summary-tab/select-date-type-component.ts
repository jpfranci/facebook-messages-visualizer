import {SummaryControl} from "../control/summary-control";
import {Component, Input} from "@angular/core";

@Component({
  selector: 'select-date-type',
  templateUrl: './select-date-type-component.html'
})
export class SelectDateTypeComponent {
  @Input() control: SummaryControl;
  private _conversionMap: Map<string, string>;

  constructor() {
    this._conversionMap = new Map<string, string>();
    this._conversionMap.set(SummaryControl.MESSAGE_TYPE, "View All Messages");
    this._conversionMap.set(SummaryControl.PHOTOS_TYPE, "View Photos Only");
    this._conversionMap.set(SummaryControl.GIFS_TYPE, "View Gifs Only");
    this._conversionMap.set(SummaryControl.VIDEOS_TYPE, "View Videos Only");
    this._conversionMap.set(SummaryControl.STICKERS_TYPE, "View Stickers Only");
    this._conversionMap.set(SummaryControl.REACTIONS_TYPE, "View Reactions Only");
  }
}
