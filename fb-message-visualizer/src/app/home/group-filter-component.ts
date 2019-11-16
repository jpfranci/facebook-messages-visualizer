import { Component, Output, EventEmitter, Input } from "@angular/core";
import { ChartGroupModel } from "../core/models";

@Component({
    selector: 'group-filter',
    templateUrl: './group-filter-component.html'
  })
export class GroupFilterComponent {
    @Output() chartGroupSelected: EventEmitter<ChartGroupModel> = new EventEmitter();
    private _chartGroupModel: ChartGroupModel;
    private _conversionMap: Map<ChartGroupModel, string>;
    private _models: Array<ChartGroupModel>;
    public static NOT_SEPARATED_NOR_STACKED: ChartGroupModel = {
        isSeparated: false,
        isStacked: false
    }
    public static SEPARATED_BUT_NOT_STACKED: ChartGroupModel = {
        isSeparated: true,
        isStacked: false
    }
    // stacking is buggy
    public static SEPARATED_AND_STACKED: ChartGroupModel = {
        isSeparated: true,
        isStacked: true
    }

    constructor() {
        this._chartGroupModel = GroupFilterComponent.NOT_SEPARATED_NOR_STACKED;
        this._conversionMap = new Map();
        this._conversionMap.set(GroupFilterComponent.NOT_SEPARATED_NOR_STACKED, "Group members together");
        this._conversionMap.set(GroupFilterComponent.SEPARATED_BUT_NOT_STACKED, "Separate members");
        this._models = Array.from(this._conversionMap.keys());
    }

    private _onGroupModelSelect(groupModel: ChartGroupModel): void {
        this._chartGroupModel = groupModel;
        this.chartGroupSelected.emit(groupModel);
    }
}