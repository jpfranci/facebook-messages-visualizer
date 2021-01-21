import {Component, OnInit, ViewChild} from '@angular/core';
import { MessageLoaderService, MessageProvider } from '../core/services';
import {ModalDirective} from "ngx-bootstrap";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private _alerts: Array<any>;
  private _shouldDeleteExistingData: boolean = false;
  @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
  private _activeTab: string;
  constructor(public _messageLoaderService: MessageLoaderService,
              public _messageProvider: MessageProvider) {
    this._alerts = [];
    this._messageLoaderService.filePickedObservable.subscribe((isOpen) => {
      if (isOpen) {
        this.modal.show();
      } else {
        this.modal.hide();
      }
    })
  }

  public loadData() {
    this.modal.hide();
    this._messageLoaderService.loadFiles((err) => {
      this._alerts.push({
        type: 'danger',
        msg: err.message,
        dismissible: true,
        timeout: 10000
      });
    }, this._shouldDeleteExistingData);
  }

  public onCheckExistingDataToggle(newValue: boolean): void {
    this._shouldDeleteExistingData = newValue;
  }

  public loadFiles() {
    this._messageLoaderService.pickFiles((err) => {
      this._alerts.push({
        type: 'danger',
        msg: err.message,
        dismissible: true,
        timeout: 10000
      });
    });
  }
}
