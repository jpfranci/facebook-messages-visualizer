import { Component, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'total-filter',
    templateUrl: './total-filter-component.html'
  })
export class TotalFilterComponent {
    @Output() totalChange: EventEmitter<boolean> = new EventEmitter();
    private _isTotal;
    private _isTotalKeys;
    private _conversionMap: Map<boolean, string>;

    constructor() {
        this._conversionMap = new Map();
        this._conversionMap.set(true, "Sum up messages");
        this._conversionMap.set(false, "Do not sum up messages");
        this._isTotalKeys = Array.from(this._conversionMap.keys());
        this._isTotal = true;
    }

    private _onSelect(isTotal: boolean): void {
        this._isTotal = isTotal;
        this.totalChange.emit(isTotal);
    }
}