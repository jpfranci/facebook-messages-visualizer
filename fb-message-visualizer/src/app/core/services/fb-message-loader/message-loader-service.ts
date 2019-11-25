import { Injectable } from '@angular/core';

import * as fs from 'fs';
import { remote } from 'electron';
import { FacebookMessagesModel, MessageModel } from '../../models/message-model';
import { bindNodeCallback } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DatabaseService } from '../db/database-service';
import { WordModel } from '../../models/word-model';
import { NgxSpinnerService } from "ngx-spinner";
import { ConversationModel } from '../../models/conversation-model';
import { MessageProvider } from './message-provider';
import { ReactionModel } from '../../models';
var iconv = require('iconv-lite');

@Injectable({
    providedIn: 'root'
})
export class MessageLoaderService {
    fs: typeof fs;
    // stopwords taken from python nltk library with some additions
    public static WHITELIST: Set<string> = new Set(["i", "me", "my", "myself", "we", "our", "ours",
        "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
        "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
        "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is",
        "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
        "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
        "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through",
        "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on",
        "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where",
        "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
        "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will",
        "just", "don", "should", "now", 'u', 'r', ' ', "ur", "it's", "its", "i'm", "im"]
    );
    public static DEFAULTNGRAMS: number = 3;
    public time: number;
    public static DEFAULT_DB_STORAGE: number = 6000;
    public static DEFAULT_MEMORY_SIZE: number = 50000;

    constructor(private _databaseService: DatabaseService,
                private _messageProvider: MessageProvider,
                private _spinner: NgxSpinnerService) {}

    public loadFiles(errorHandler: Function): void {
        let files = remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Messages', extensions: ['json']}]
          });
        if (files && files.length > 0) {
            this._spinner.show();
            const callback = bindNodeCallback(fs.readFile);
            this.time = Date.now();
            callback(files[0]).pipe(
                map((fbJson: Buffer) => JSON.parse(fbJson.toString())),
                take(1)
            ).subscribe((content: FacebookMessagesModel) => {
                try {
                    this._processMessages(content);
                } catch(err) {
                    console.log(err);
                    errorHandler(new Error("Error processing Facebook message file, make sure that the file you provided is the one downloaded from requesting your data from Facebook."));
                } finally {
                    this._spinner.hide();
                }
            })
        }
    }

    private _processMessages(messages: FacebookMessagesModel): void {
        const participants = messages.participants.map(participant => participant.name);
        let wordsDetail: {
            words: Array<WordModel>,
            reactions: Array<ReactionModel>,
            totalWords: number,
            dates: any
        } = this.createDatabaseRepresentation(messages, messages.title);
        const numToInsert: number = wordsDetail.words.length > MessageLoaderService.DEFAULT_DB_STORAGE ?
        MessageLoaderService.DEFAULT_DB_STORAGE : wordsDetail.words.length;
        const conversationModel: ConversationModel = {
            displayName: messages.title,
            participants: participants.join(),
            totalWords: wordsDetail.totalWords,
            nGrams: MessageLoaderService.DEFAULTNGRAMS,
            processedWords: wordsDetail.words.length,
            storedWords: numToInsert,
            totalMessages: messages.messages.length,
            dates: JSON.stringify(wordsDetail.dates.content),
            photos: JSON.stringify(wordsDetail.dates.photos),
            stickers: JSON.stringify(wordsDetail.dates.stickers),
            videos: JSON.stringify(wordsDetail.dates.videos),
            gifs: JSON.stringify(wordsDetail.dates.gifs),
            startDate: new Date(messages.messages[messages.messages.length - 1].timestamp_ms).toString(),
            endDate: new Date(messages.messages[0].timestamp_ms).toString()
        };
        const wordsToSave = wordsDetail.words.slice(0, MessageLoaderService.DEFAULT_MEMORY_SIZE);
        wordsDetail.words = [];
        this._messageProvider.setMemoryModel(wordsToSave, conversationModel);
        this._insertReactions(wordsDetail.reactions);
        this._insertWords(wordsToSave, numToInsert, conversationModel);
    }

    public getTotalFrequency(frequencies: {}): number {
        let accum = 0;
        for (let name in frequencies) {
            if (frequencies.hasOwnProperty(name)) {
                accum += frequencies[name];
            }
        }
        return accum;
    }

    public sumUpDatesObject(dates: any): number {
        return Object.keys(dates).reduce((accum, participant) => {
            const participantTotal = this.sumUpIndividualInDateObject(dates[participant]);
            return participantTotal + accum;
        }, 0)
    }

    public sumUpIndividualInDateObject(participantDateObject: {}): number {
      return Object.keys(participantDateObject).reduce((accumDate, date) => {
        return accumDate + participantDateObject[date];
      }, 0);
    }

    private async _insertReactions(reactions: Array<ReactionModel>): Promise<void> {
        await this._databaseService.insertIntoTable(DatabaseService.REACTIONS_TABLE, reactions);
        this._messageProvider.addToReactions(reactions);
    }

    private async _insertWords(
        words: Array<WordModel>,
        numToInsert: number,
        conversationModel: ConversationModel): Promise<void> {
            const iterations = Math.floor(numToInsert / 100);
            let currentEnd: number = 0;
            for (let i = 0; i < iterations; i++) {
                await this._databaseService.insertIntoTable(DatabaseService.WORDS_TABLE, words.slice(currentEnd, currentEnd + 100))
                    .catch(err => console.log(err));
                currentEnd += 100;
            }
            await this._databaseService.insertIntoTable(DatabaseService.WORDS_TABLE, words.slice(currentEnd, numToInsert))
                .catch(err => console.log(err));
            await this._databaseService.insertIntoTable(DatabaseService.CONVERSATION_TABLE, conversationModel)
                .catch(err => console.log(err));
    }

    public createDatabaseRepresentation(
        facebookMessageModel: FacebookMessagesModel,
        oDisplayName: string): {
            words: Array<WordModel>,
            reactions: Array<ReactionModel>
            totalWords: number ,
            dates: any
        } {
            let totalWords: number = 0;
            let wordObject: {} = {};
            let dates: any = {
                content: {},
                photos: {},
                stickers: {},
                gifs: {},
                videos: {}
            };
            let reactionObject: {} = {};
            // for loops are much more performant than forEach
            for (let i = 0, len = facebookMessageModel.messages.length; i < len; i++) {
                const messageModel: MessageModel = facebookMessageModel.messages[i];
                const dateString: string = new Date(messageModel.timestamp_ms).toDateString();
                const sender: string = messageModel.sender_name;
                if (messageModel.hasOwnProperty('content')) {
                    this._addToDates(dates.content, dateString, sender);
                    const formattedContent: string = this._cleanString(messageModel.content);
                    const tokens: Array<string> = formattedContent.split(' ');
                    totalWords += tokens.length;
                    this._processNGrams(tokens, wordObject, sender, dateString);
                }
                if (messageModel.hasOwnProperty('sticker')) {
                    this._addToDates(dates.stickers, dateString, sender);
                }
                if (messageModel.hasOwnProperty('gifs')) {
                    this._addToDates(dates.gifs, dateString, sender);
                }
                if (messageModel.hasOwnProperty('reactions')) {
                    this._processReactions(reactionObject, messageModel.reactions, dateString);
                }
                if (messageModel.hasOwnProperty('photos')) {
                    this._addToDates(dates.photos, dateString, sender);
                }

                if (messageModel.hasOwnProperty('videos')) {
                    this._addToDates(dates.videos, dateString, sender);
                }
            }
            const wordArray = this._getModelArray<WordModel>(wordObject, oDisplayName, "word");
            const reactionArray = this._getModelArray<ReactionModel>(reactionObject, oDisplayName, "reaction");
            console.log(Date.now() - this.time);
            wordObject = {};
            reactionObject = {};
            return {
                words: wordArray,
                reactions: reactionArray,
                totalWords: totalWords,
                dates: dates
            };
    }

    private _getModelArray<T>(accumObject: {}, displayName: string, keyDisplayName: string): Array<T> {
        const sortedKeys: Array<string> = Object.keys(accumObject).sort(
            (modelKeyA: string, modelKeyB: string) => {
                return this.getTotalFrequency(accumObject[modelKeyB].frequencies) -
                    this.getTotalFrequency(accumObject[modelKeyA].frequencies);
        });
        return this._collectIntoModelArray<T>(
            accumObject,
            sortedKeys,
            displayName,
            keyDisplayName
        )
    }

    private _collectIntoModelArray<T>(
        accumObject: {},
        keys: Array<string>,
        displayName: string,
        keyDisplayName: string): Array<T> {

        let modelArray: Array<any> = [];
        for (let i = 0, len = keys.length; i < len; i++) {
            const key: string = keys[i];
            modelArray.push({
                [keyDisplayName]: key,
                displayName: displayName,
                frequencies: JSON.stringify(accumObject[key].frequencies),
                dates: JSON.stringify(accumObject[key].dates),
                startDate: accumObject[key].startDate,
                endDate: accumObject[key].endDate
            })
        }
        return <Array<T>> modelArray;
    }

    private _processReactions(
        reactionObject: {},
        reactions: Array<{reaction: string, actor: string}>,
        dateString: string): void {
        for (let i = 0, len = reactions.length; i < len; i++) {
            const reaction: {reaction: string, actor: string} = reactions[i];
            const reactionToSave: string = this._cleanString(reaction.reaction);
            if (reactionObject.hasOwnProperty(reactionToSave)) {
                this._incrementFrequencies(reactionObject, reactionToSave, reaction.actor, dateString);
            } else {
                this._initFrequencies(reactionObject, reactionToSave, reaction.actor, dateString);
            }
        }
    }

    private _addToDates(dates: {}, dateString: string, sender: string): void {
        if (dates.hasOwnProperty(sender)) {
            if (dates[sender].hasOwnProperty(dateString)) {
                dates[sender][dateString] = dates[sender][dateString] + 1;
            } else {
                dates[sender][dateString] = 1;
            }
        } else {
            dates[sender] = {
                [dateString]: 1
            }
        }
    }

    private _processNGrams(
        tokens: Array<string>,
        wordObject: {},
        sender: string,
        dateString: string): void {
        for (let n = 1; n <= MessageLoaderService.DEFAULTNGRAMS; n++) {
            let ngrams: Array<Array<string>> = this._generateNGrams(tokens, n);
            for (let i = 0, len = ngrams.length; i < len; i++) {
                const words = ngrams[i];
                const wordToInsert: string = words.join(' ');
                // filter numbers and anything in the whitelist
                if (Number.isNaN(Number(wordToInsert)) &&
                    wordToInsert.length > 1 &&
                    words.some(word => !MessageLoaderService.WHITELIST.has(word))) {
                    if (wordObject.hasOwnProperty(wordToInsert)) {
                        this._incrementFrequencies(wordObject, wordToInsert, sender, dateString);
                    } else {
                        this._initFrequencies(wordObject, wordToInsert, sender, dateString);
                    }
                }
            }
        }
    }

    private _cleanString(str: string): string {
        // fb messages are encoded with latin1, so have to encode strings as latin1
        // before reading as utf-8
        const decodedString: string = iconv.decode(iconv.encode(str.toLowerCase(), 'latin1'), 'utf-8');
        return decodedString;
    }

    private _generateNGrams(tokens: Array<string>, n: number): Array<Array<string>> {
        let nGrams: Array<Array<string>> = [];
        for (let anchor = 0; anchor + n <= tokens.length; anchor++) {
            nGrams.push(tokens.slice(anchor, anchor + n));
        }
        return nGrams;
    }

    private _initFrequencies(accumObject: {}, toInsert: string, sender: string, dateString: string): void {
        accumObject[toInsert] = {
            frequencies: {
                [sender]: 1
            },
            dates: {
                [sender]: {
                    [dateString]: 1
                }
            },
            startDate: dateString,
            endDate: dateString
        }
    }

    private _incrementFrequencies(accumObject: {}, toInsert: string, sender: string, dateString: string): void {
        accumObject[toInsert].startDate = dateString;
        if (accumObject[toInsert].frequencies.hasOwnProperty(sender)) {
            accumObject[toInsert].frequencies[sender] = accumObject[toInsert].frequencies[sender] + 1
        } else {
            accumObject[toInsert].frequencies[sender] = 1;
        }
        if (accumObject[toInsert].dates[sender]) {
            if (accumObject[toInsert].dates[sender].hasOwnProperty(dateString)) {
                accumObject[toInsert].dates[sender][dateString] =
                    accumObject[toInsert].dates[sender][dateString] + 1;
            } else {
                accumObject[toInsert].dates[sender][dateString] = 1;
            }
        } else {
            accumObject[toInsert].dates[sender] = {
                [dateString]: 1
            }
        }
    }
}
