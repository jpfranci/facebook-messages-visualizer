import {Component} from "@angular/core";
import {GraphMessageProvider} from "../../core/services";

@Component({
  selector: 'x-axis-selection',
  templateUrl: './x-axis-selection-component.html'
})
export class XAxisSelectionComponent {
  public _dropdownOptions = [GraphMessageProvider.TIME_AXIS, GraphMessageProvider.PARTICIPANTS_AXIS];

  constructor(public _graphMessageProvider: GraphMessageProvider) {}
}
