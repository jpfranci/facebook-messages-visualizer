import { ConversationModel } from "./conversation-model";

export class ConversationModelConversions {
    public static toParticipantsArray(conversationModel: ConversationModel): string[] {
        return conversationModel.participants.split(",")
    }

    public static isEmpty(dateObject: string): boolean {
      return dateObject != '{}';
    }
}
