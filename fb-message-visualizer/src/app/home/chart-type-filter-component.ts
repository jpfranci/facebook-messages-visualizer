import { Component, Output, EventEmitter, Input } from "@angular/core";

@Component({
    selector: 'chart-type-filter',
    templateUrl: './chart-type-filter-component.html'
  })
export class ChartTypeFilterComponent {
    @Input() chartType: string;
    @Output() chartTypeSelect: EventEmitter<string> = new EventEmitter();
    public static barType = 'bar';
    public static lineType = 'line';
    private _conversionMap: Map<string, string>;
    private _types;
    private _selectedType;

    constructor() {
        this._conversionMap = new Map<string, string>();
        this._conversionMap.set(ChartTypeFilterComponent.lineType, "Line Chart");
        this._conversionMap.set(ChartTypeFilterComponent.barType, "Bar Chart");
        this._types = Array.from(this._conversionMap.keys());
    }

    onChartTypeSelect(type: string): void {
        this.chartType = type;
        this.chartTypeSelect.emit(type);
    }
}