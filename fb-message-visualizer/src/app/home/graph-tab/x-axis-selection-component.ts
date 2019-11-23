import {Component} from "@angular/core";
import {GraphMessageProvider} from "../../core/services";

@Component({
  selector: 'x-axis-selection',
  templateUrl: './x-axis-selection-component.html'
})
export class XAxisSelectionComponent {
  private _dropdownOptions = [GraphMessageProvider.TIME_AXIS, GraphMessageProvider.PARTICIPANTS_AXIS];

  constructor(private _graphMessageProvider: GraphMessageProvider) {}
}
