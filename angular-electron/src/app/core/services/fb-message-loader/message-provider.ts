import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { take, switchMap, filter } from 'rxjs/operators';
import { WordModel } from '../../models/word-model';
import { DatabaseService } from '../db/database-service';
import { ConversationModel } from '../../models';

@Injectable({
    providedIn: 'root'
})
export class MessageProvider {
    private _inMemorySubject: BehaviorSubject<Array<WordModel>>;
    private _hasDataSubject: BehaviorSubject<boolean>

    constructor(private _databaseService: DatabaseService) {
        this._inMemorySubject = new BehaviorSubject<Array<WordModel>>([]);
        this._hasDataSubject = new BehaviorSubject<boolean>(false);
        this._databaseService.createdTablesObservable.pipe(
            filter((areTablesCreated: boolean) => areTablesCreated === true),
            take(1),
            switchMap(() => from(this._databaseService.getAllFromTable(DatabaseService.CONVERSATION_TABLE))),
            take(1)
        ).subscribe(
            (conversationModels: Array<ConversationModel>) => {
                if (conversationModels.length > 0) {
                    this._hasDataSubject.next(true);
                }
            },
            (err: Error) => console.log(err)
        )
    }

    public setMemoryModel(wordModels: Array<WordModel>): void {
        if (wordModels.length > 0) {
            this._inMemorySubject.next(wordModels);
            this._hasDataSubject.next(true);
        }
    }

    public get inMemorySubject(): BehaviorSubject<Array<WordModel>> {
        return this._inMemorySubject;
    }

    public get hasDataSubject(): BehaviorSubject<boolean> {
        return this._hasDataSubject;
    }
}