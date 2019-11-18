import { Component, OnInit } from '@angular/core';
import { MessageLoaderService, MessageProvider } from '../core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private _alerts: Array<any>;
  constructor(private _messageLoaderService: MessageLoaderService, 
              private _messageProvider: MessageProvider) {
    this._alerts = [];
  }

  public loadFiles() {
    this._messageLoaderService.loadFiles((err) => {
      this._alerts.push({
        type: 'danger',
        msg: err.message,
        dismissible: true,
        timeout: 10000
      });
    });
  }
}
