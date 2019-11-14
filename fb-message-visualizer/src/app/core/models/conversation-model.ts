export interface ConversationModel {
    displayName: string,
    participants: string,
    totalWords: number,
    nGrams: number,
    processedWords: number,
    storedWords: number,
    totalMessages: number,
    // json object of participant: { date: occurences }*
    dates: string,
    startDate: string,
    endDate: string
}