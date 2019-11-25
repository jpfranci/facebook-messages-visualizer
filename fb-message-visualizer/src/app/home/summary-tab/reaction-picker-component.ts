import {Component, Input} from "@angular/core";
import {SummaryControl} from "../control/summary-control";

@Component({
  selector: 'reaction-picker',
  templateUrl: './reaction-picker-component.html'
})
export class ReactionPickerComponent {
  @Input() control: SummaryControl;

  private _getSelectedDisplayString(): string {
    return this.control.selectedReaction ? this.control.selectedReaction.reaction : "See all reactions";
  }
}
