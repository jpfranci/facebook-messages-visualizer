import { Component, Output, EventEmitter } from "@angular/core";
import { GraphMessageProvider } from "../../core/services";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

@Component({
    selector: 'total-filter',
    templateUrl: './total-filter-component.html'
  })
export class TotalFilterComponent {
    public _isTotalKeys;
    public _conversionMap: Map<boolean, string>;

    constructor(public _graphMessageProvider: GraphMessageProvider) {
        this._conversionMap = new Map();
        this._conversionMap.set(true, "Sum up messages");
        this._conversionMap.set(false, "Do not sum up messages");
        this._isTotalKeys = Array.from(this._conversionMap.keys());
    }

    private _getCurrentTotalFilter(): Observable<string> {
        return this._graphMessageProvider.useTotalObservable.pipe(
            map((useTotal: boolean) => this._conversionMap.get(useTotal)),
            take(1)
        );
    }

    private _onSelect(useTotal: boolean): void {
        this._graphMessageProvider.useTotal = useTotal;
    }
}
