import { Injectable } from "@angular/core";
import { from, BehaviorSubject, Observable } from 'rxjs';
import { WordModel } from '../../models/word-model';
import { ConversationModel } from '../../models/conversation-model';
import { MessageModel } from "../../models/message-model";
import { MessageProvider } from "../fb-message-loader/message-provider";
@Injectable({
    providedIn: 'root'
}) 

export class DatabaseService {
    public static CONVERSATION_TABLE: string = "Conversation";
    public static WORDS_TABLE: string = "Words";
    public static PAST_SEARCHES_TABLE: string = "PastSearches";
    private static MAX_CHARACTERS_STRING: number = 1000;
    private _createdTablesObservable: BehaviorSubject<boolean>;
    private db;
    constructor() {
        this.db = require('knex')({
            dialect: 'sqlite3',
            connection: {
              filename: './test10.db',
            },
          });
        
        this._createdTablesObservable = new BehaviorSubject<boolean>(false);  
        this.buildTables();
    }

    public get createdTablesObservable(): Observable<boolean> {
        return this._createdTablesObservable;
    }

    private async buildTables(): Promise<void> {
        // await this.db.schema.dropTableIfExists(DatabaseService.CONVERSATION_TABLE);
        // await this.db.schema.dropTableIfExists(DatabaseService.WORDS_TABLE);
        // await this.db.schema.dropTableIfExists(DatabaseService.PAST_SEARCHES_TABLE);
        let doesExist: boolean = await this.db.schema.hasTable(DatabaseService.CONVERSATION_TABLE);
        if (!doesExist) {
            await this.db.schema.createTable(DatabaseService.CONVERSATION_TABLE, (table) => {
                // Display name on facebook 
                table.string('displayName', DatabaseService.MAX_CHARACTERS_STRING).primary(),
                // comma separated string
                table.string('participants', DatabaseService.MAX_CHARACTERS_STRING),
                table.integer('totalWords'),
                table.integer('nGrams'),
                table.integer('processedWords'),
                table.integer('storedWords'),
                table.integer('totalMessages'),
                table.json('dates'),
                table.string('startDate'),
                table.string('endDate')
            });
        }
        
        doesExist = await this.db.schema.hasTable(DatabaseService.WORDS_TABLE);
        if (!doesExist) {
            await this.db.schema.createTableIfNotExists(DatabaseService.WORDS_TABLE, (table) => {
                table.string('word'),
                table.string('displayName', DatabaseService.MAX_CHARACTERS_STRING),
                // Frequencies for all participants
                table.json('frequencies'),
                // Json representing all dates word is used
                table.json('dates'),
                table.string('startDate'),
                table.string('endDate')
                table.primary(['word', 'displayName'])
            });
        }
        
        doesExist = await this.db.schema.hasTable(DatabaseService.PAST_SEARCHES_TABLE);
        if(!doesExist) {
            await this.db.schema.createTableIfNotExists(DatabaseService.PAST_SEARCHES_TABLE, (table) => {
                table.string('displayName', DatabaseService.MAX_CHARACTERS_STRING),
                table.json('search'),
                table.primary('displayName')
            });
        }

        this._createdTablesObservable.next(true);
    }

    public insertIntoTable(tableName: string, values: ConversationModel | Array<WordModel>): Promise<any> {
        return this.db.insert(values).into(tableName);
    }

    public getAllFromTable(tableName: string): Promise<Array<ConversationModel>> | Promise<Array<WordModel>> {
        return this.db(tableName);
    }

    public getAllFromTableWithDisplayName(tableName: string, displayName: string): Promise<any> {
        return this.db(tableName).where({displayName: displayName}).catch(err => console.log(err));
    }

    public getAllWordsThatMatchPattern(tableName: string, pattern: string): Promise<Array<WordModel>> {
        return this.db(tableName).where('word', 'like', '%like%');
    }
}