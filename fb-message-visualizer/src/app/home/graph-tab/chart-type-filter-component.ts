import { Component, Output, EventEmitter, Input } from "@angular/core";
import { GraphMessageProvider } from "../../core/services";
import { ChartType } from "chart.js";

@Component({
    selector: 'chart-type-filter',
    templateUrl: './chart-type-filter-component.html'
  })
export class ChartTypeFilterComponent {
    private _conversionMap: Map<string, string>;
    private _types;
    private _selectedType;

    constructor(private _graphMessageProvider: GraphMessageProvider) {
        this._conversionMap = new Map<string, string>();
        this._conversionMap.set('line' , "Line Chart");
        this._conversionMap.set('bar', "Bar Chart");
        this._types = Array.from(this._conversionMap.keys());
    }

    onChartTypeSelect(type: string): void {
        this._graphMessageProvider.chartType = <ChartType> type;
    }
}