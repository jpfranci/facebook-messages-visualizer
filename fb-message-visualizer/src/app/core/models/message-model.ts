export interface FacebookMessagesModel {
    participants: Array<{
        name: string
    }>,
    messages: Array<MessageModel>,
    title: string,
    is_still_participant: boolean,
    thread_type: string,
    thread_path: string
} 

export interface MessageModel {
    sender_name: string,
    timestamp_ms: number,
    content?: string,
    reactions?: Array<{reaction: string, actor: string}>,
    videos?: Array<{}>,
    photos?: Array<{}>,
    gifs?: Array<{}>,
    sticker?: {},
    type: string 
}