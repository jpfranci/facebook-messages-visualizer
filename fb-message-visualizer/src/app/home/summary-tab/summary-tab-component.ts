import { Component } from "@angular/core";
import { MessageProvider, MessageLoaderService } from "../../core/services";
import { ReactionModel } from "../../core/models";
import { switchMap, filter } from "rxjs/operators";

@Component({
    selector: 'summary-tab',
    templateUrl: './summary-tab-component.html',
    styleUrls: ['./summary-tab-component.scss']
  })
export class SummaryTabComponent {
    constructor(private _messageProvider: MessageProvider,
                private _messageLoaderService: MessageLoaderService) {
    }

    private _getTotalOfDateObject(dateObject: string): number {
      return this._messageLoaderService.sumUpDatesObject(JSON.parse(dateObject));
    }

    private _hasReactions(reactionModels: Array<ReactionModel>, displayName: string): boolean {
      return reactionModels.some(reactionModel => reactionModel.displayName === displayName);
    }

    private _getTotalOfReactions(reactionModels, displayName: string): number {
      const reactionModelsToSum = reactionModels.filter(reactionModel => reactionModel.displayName === displayName);
      return reactionModelsToSum.reduce((accum, reactionModel) => {
        const frequencies = JSON.parse(reactionModel.frequencies);
        const totalForReaction = Object.keys(frequencies).reduce((accumParticipant, participant) => {
          return frequencies[participant] + accumParticipant;
        }, 0)
        return totalForReaction + accum;
      }, 0)
    }
}