import {Component, Input, ViewChild} from "@angular/core";
import {ChartControl} from "../control/chart-control";
import {ModalDirective} from "ngx-bootstrap";

@Component({
    selector: 'chart-filters',
    templateUrl: './chart-filters.html',
    styleUrls: ['./chart-filters.scss']
  })
export class ChartFilters {
  @Input() control: ChartControl;
  @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

  ngAfterViewInit() {
      this.modal.config = {
        keyboard: false
      };
  }
}
