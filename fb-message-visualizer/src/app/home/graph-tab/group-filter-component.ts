import { Component, Output, EventEmitter, Input } from "@angular/core";
import { ChartGroupModel } from "../../core/models";
import { GraphMessageProvider } from "../../core/services";

@Component({
    selector: 'group-filter',
    templateUrl: './group-filter-component.html'
  })
export class GroupFilterComponent {
    @Output() chartGroupSelected: EventEmitter<ChartGroupModel> = new EventEmitter();
    private _conversionMap: Map<ChartGroupModel, string>;
    private _models: Array<ChartGroupModel>;

    constructor(private _graphMessageProvider: GraphMessageProvider) {
        this._conversionMap = new Map();
        this._conversionMap.set(GraphMessageProvider.NOT_SEPARATED_NOR_STACKED, "Group members together");
        this._conversionMap.set(GraphMessageProvider.SEPARATED_BUT_NOT_STACKED, "Separate members");
        this._models = Array.from(this._conversionMap.keys());
    }

    private _onGroupModelSelect(groupModel: ChartGroupModel): void {
        this._graphMessageProvider.chartGroupModel = groupModel;
    }
}