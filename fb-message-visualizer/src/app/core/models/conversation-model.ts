export interface ConversationModel {
    displayName: string,
    participants: string,
    totalWords: number,
    nGrams: number,
    processedWords: number,
    storedWords: number,
    totalMessages: number,

    // json objects of participant: { date: occurences }[]
    dates: string,
    photos: string,
    stickers: string,
    videos: string,
    gifs: string,

    startDate: string,
    endDate: string
}