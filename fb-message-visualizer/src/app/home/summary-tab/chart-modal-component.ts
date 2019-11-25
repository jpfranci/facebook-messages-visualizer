import {Component, Input, ViewChild} from "@angular/core";
import {SummaryControl} from "../control/summary-control";
import {ModalDirective} from "ngx-bootstrap";

@Component({
  selector: 'chart-modal',
  templateUrl: './chart-modal-component.html',
  styleUrls: ['./chart-modal-component.scss']
})
export class ChartModalComponent  {
  @Input() control: SummaryControl;
  @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

  ngAfterViewInit() {
    this.control.chartModal = this.modal;
    this.modal.config = {
      keyboard: false
    };
  }
}
