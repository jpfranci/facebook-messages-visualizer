import {Component, Input} from "@angular/core";
import {ConversationModel, ConversationModelConversions, ReactionModel} from "../../core/models";
import {MessageLoaderService, MessageProvider} from "../../core/services";
import {SummaryControl} from "../control/summary-control";

@Component({
  selector: 'summaries',
  templateUrl: './summaries-component.html',
  styleUrls: ['./summaries-component.scss']
})
export class SummariesComponent {
  @Input() conversationModel: ConversationModel;
  @Input() control: SummaryControl;

  constructor(private _messageLoaderService: MessageLoaderService,
              private _messageProvider: MessageProvider) {}

  private _getTotalOfDateObject(dateObject: string): number {
    return this._messageLoaderService.sumUpDatesObject(JSON.parse(dateObject));
  }

  private _hasReactions(reactionModels: Array<ReactionModel>, displayName: string): boolean {
    return this.control.hasReactions(reactionModels, displayName);
  }

  private _isPopulated(conversationModelField: string): boolean {
    return !ConversationModelConversions.isEmpty(conversationModelField);
  }

  private _getTotalOfReactions(reactionModels, displayName: string): number {
    const reactionModelsToSum = reactionModels.filter(reactionModel => reactionModel.displayName === displayName);
    return reactionModelsToSum.reduce((accum, reactionModel) => {
      const frequencies = JSON.parse(reactionModel.frequencies);
      const totalForReaction = Object.keys(frequencies).reduce((accumParticipant, participant) => {
        return frequencies[participant] + accumParticipant;
      }, 0);
      return totalForReaction + accum;
    }, 0)
  }
}
