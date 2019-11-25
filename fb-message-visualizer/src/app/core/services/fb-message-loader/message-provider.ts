import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { take, switchMap, filter, map, tap, debounceTime } from 'rxjs/operators';
import { WordModel } from '../../models/word-model';
import { DatabaseService } from '../db/database-service';
import { ConversationModel, ReactionModel } from '../../models';
import {GraphMessageProvider} from "./graph-message-provider";

@Injectable({
    providedIn: 'root'
})
export class MessageProvider {
    private _inMemorySubject: BehaviorSubject<Array<WordModel>>;
    private _hasDataSubject: BehaviorSubject<boolean>;
    private _availableConversations: BehaviorSubject<Array<ConversationModel>>;
    private _availableReactions: BehaviorSubject<Array<ReactionModel>>;
    private _isAppReadyToUse: BehaviorSubject<boolean>;

  constructor(private _databaseService: DatabaseService) {
        this._inMemorySubject = new BehaviorSubject<Array<WordModel>>([]);
        this._availableReactions = new BehaviorSubject<Array<ReactionModel>>([]);
        this._hasDataSubject = new BehaviorSubject<boolean>(false);
        this._isAppReadyToUse = new BehaviorSubject<boolean>(false);
        this._availableConversations = new BehaviorSubject<Array<ConversationModel>>([]);
        this._databaseService.createdTablesObservable.pipe(
            filter((areTablesCreated: boolean) => areTablesCreated === true),
            switchMap(() => from(this._databaseService.getAllFromTable(DatabaseService.CONVERSATION_TABLE))),
            take(1)
        ).subscribe(
            (conversationModels: Array<ConversationModel>) => {
                this._isAppReadyToUse.next(true);
                if (conversationModels.length > 0) {
                    this._hasDataSubject.next(true);
                    this._availableConversations.next(conversationModels);
                    this.getReactions().subscribe((reactions) => {
                        this._availableReactions.next(reactions);
                    })
                }
            },
            (err: Error) => console.log(err)
        )

    }

    public get reactionModels(): Observable<Array<ReactionModel>> {
        return this._availableReactions;
    }

    public addToReactions(reactionsModels: Array<ReactionModel>): void {
        const newReactionModels = [...this._availableReactions.getValue(), ...reactionsModels];
        this._availableReactions.next(newReactionModels);
    }

    public setMemoryModel(wordModels: Array<WordModel>, conversationModel: ConversationModel): void {
        if (wordModels.length > 0) {
            // only allow one conversation in memory at any given time
            let currMemoryModel = this._inMemorySubject.getValue();
            this._inMemorySubject.next(wordModels);
            this._hasDataSubject.next(true);
            let currConversations: Array<ConversationModel> = this._availableConversations.getValue().slice();
            if (!currConversations.map(conversationModel => conversationModel.displayName).includes(conversationModel.displayName)) {
                currConversations.push(conversationModel);
                this._availableConversations.next(currConversations);
            }
        }
    }

    public getWords(displayName: string, searchTerm: string): Observable<Array<WordModel>> {
        let currMemoryModel = this._inMemorySubject.getValue();
        if (currMemoryModel.length > 0 && displayName === currMemoryModel[0].displayName) {
            return this._inMemorySubject;
        } else {
            if (searchTerm.length > 0) {
                return from(this._databaseService.getAllWordsThatMatchPattern(DatabaseService.WORDS_TABLE, searchTerm));
            } else {
                return from(this._databaseService.getAllFromTableWithDisplayName(DatabaseService.WORDS_TABLE,
                    displayName));
            }
        }
    }

    public getConversationModel(displayName: string): Observable<ConversationModel> {
        return from(this._databaseService.getAllFromTableWithDisplayName(DatabaseService.CONVERSATION_TABLE, displayName)
            ).pipe(
                filter((conversationModels: Array<ConversationModel>) => conversationModels.length > 0),
                map((conversationModels: Array<ConversationModel>) => conversationModels[0])
            );
    }

    public getReactions(): Observable<Array<ReactionModel>> {
        return <Observable<Array<ReactionModel>>> from(this._databaseService.getAllFromTable(DatabaseService.REACTIONS_TABLE)
            ).pipe(
                filter(reactions => reactions.length > 0),
                take(1)
            )
    }

    public get availableConversations(): Observable<Array<ConversationModel>> {
        return this._availableConversations;
    }

    public get inMemorySubject(): BehaviorSubject<Array<WordModel>> {
        return this._inMemorySubject;
    }

    public get hasDataSubject(): BehaviorSubject<boolean> {
        return this._hasDataSubject;
    }

    public get isAppReadyToUse(): Observable<boolean> {
        return this._isAppReadyToUse;
    }
}
