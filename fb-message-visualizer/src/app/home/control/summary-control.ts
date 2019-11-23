import {GraphMessageProvider} from "../../core/services";
import {ModalDirective} from "ngx-bootstrap";
import {ConversationModel} from "../../core/models";

export class SummaryControl {
  private _chartModal: ModalDirective;
  private _conversationModel: ConversationModel;
  private _availableGeneralFilters: Array<{}>;

  constructor(private _graphMessageProvider: GraphMessageProvider) {}

  public set chartModal(chartModal: ModalDirective) {
    this._chartModal = chartModal;
  }

  public showChartModal(conversationModel: ConversationModel): void {
    this._conversationModel = conversationModel;
    this._chartModal.show();
  }
}
