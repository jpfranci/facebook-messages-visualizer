import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WordModel} from '../../models/word-model';
import {ConversationModel} from '../../models/conversation-model';
import {ReactionModel} from '../../models';

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {
  public static CONVERSATION_TABLE: string = 'Conversation';
  public static WORDS_TABLE: string = 'Words';
  public static REACTIONS_TABLE: string = 'Reactions';
  public static PAST_SEARCHES_TABLE: string = 'PastSearches';
  private static MAX_CHARACTERS_STRING: number = 1000;
  private _createdTablesObservable: BehaviorSubject<boolean>;
  private db;

  constructor() {
    const app = require('electron').remote.app;
    this.db = require('knex')({
      dialect: 'sqlite3',
      connection: {
        filename: `${app.getPath('userData')}/testdb.db`,
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
          table.json('photos'),
          table.json('stickers'),
          table.json('videos'),
          table.json('gifs'),
          table.string('startDate'),
          table.string('endDate');
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
            table.string('endDate'),
            table.foreign('displayName')
              .references(`${DatabaseService.CONVERSATION_TABLE}.displayName`)
              .onDelete('CASCADE'),
            table.primary(['word', 'displayName']);
        }
      );
    }

    doesExist = await this.db.schema.hasTable(DatabaseService.REACTIONS_TABLE);
    if (!doesExist) {
      await this.db.schema.createTableIfNotExists(DatabaseService.REACTIONS_TABLE, (table) => {
        table.string('reaction'),
          table.string('displayName', DatabaseService.MAX_CHARACTERS_STRING),
          // Frequencies for all participants
          table.json('frequencies'),
          // Json representing all dates word is used
          table.json('dates'),
          table.string('startDate'),
          table.string('endDate'),
          table.foreign('displayName')
            .references(`${DatabaseService.CONVERSATION_TABLE}.displayName`)
            .onDelete('CASCADE'),
          table.primary(['reaction', 'displayName']);
      });
    }

    doesExist = await this.db.schema.hasTable(DatabaseService.PAST_SEARCHES_TABLE);
    if (!doesExist) {
      await this.db.schema.createTableIfNotExists(DatabaseService.PAST_SEARCHES_TABLE, (table) => {
        table.string('displayName', DatabaseService.MAX_CHARACTERS_STRING),
          table.json('chartOptions'),
          table.json('dataset'),
          table.foreign('displayName')
            .references(`${DatabaseService.CONVERSATION_TABLE}.displayName`)
            .onDelete('CASCADE'),
          table.primary('displayName');
      });
    }

    this._createdTablesObservable.next(true);
  }

  public insertIntoTable(
    tableName: string,
    values: ConversationModel | Array<WordModel> | Array<ReactionModel>): Promise<any> {
    return this.db.insert(values).into(tableName);
  }

  public deleteConversationWithDisplayName(displayName: string): Promise<any> {
    return this.db
      .delete()
      .table(DatabaseService.CONVERSATION_TABLE)
      .where({displayName: displayName});
  }

  public getAllFromTable(tableName: string): Promise<Array<ConversationModel>> | Promise<Array<WordModel>> | Promise<Array<ReactionModel>> {
    return this.db.transaction((trx) => {
      return trx
        .select()
        .table(tableName);
    });
  }

  public getAllFromTableWithDisplayName(tableName: string, displayName: string): Promise<any> {
    return this.db.transaction((trx) => {
      return trx
        .select()
        .table(tableName)
        .where({displayName: displayName})
        .catch(err => console.log(err));
    });
  }

  public getAllWordsThatMatchPattern(tableName: string, pattern: string): Promise<Array<WordModel>> {
    return this.db(tableName).where('word', 'like', '%like%');
  }
}
