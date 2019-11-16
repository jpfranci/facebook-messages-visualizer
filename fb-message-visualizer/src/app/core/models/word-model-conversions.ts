import { WordModel } from "./word-model";

export class WordModelConversions {
    public static toAvailableParticipants(wordModel: WordModel): string[] {
        return Object.keys(JSON.parse(wordModel.frequencies));
    }
}