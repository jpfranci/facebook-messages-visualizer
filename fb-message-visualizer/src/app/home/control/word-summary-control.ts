import {GraphMessageProvider} from "../../core/services";

export class WordSummaryControl {
  public gridApi;
  public gridColumnApi;
  constructor(private _graphMessageProvider: GraphMessageProvider) {

  }

  public resizeGrid() {
    if (this.gridApi) {
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      });
    }
  }
}
