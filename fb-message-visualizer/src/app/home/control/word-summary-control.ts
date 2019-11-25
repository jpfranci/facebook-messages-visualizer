import {GraphMessageProvider, SaveDataService} from "../../core/services";

export class WordSummaryControl {
  public gridApi;
  public gridColumnApi;
  constructor(private _graphMessageProvider: GraphMessageProvider,
              private _saveDataService: SaveDataService) {

  }

  public saveGridAsCSV() {
    if (this.gridApi) {
      const csvData = this.gridApi.getDataAsCsv();
      this._saveDataService.saveCSV(csvData);
    }
  }

  public resizeGrid() {
    if (this.gridApi) {
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      });
    }
  }
}
