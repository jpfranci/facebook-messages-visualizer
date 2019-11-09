import { Injectable } from '@angular/core';

import * as fs from 'fs';
import { remote } from 'electron';
import { Observable, BehaviorSubject, bindNodeCallback, from, empty, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class MessageLoaderService {
    fs: typeof fs;
   private _lol: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    constructor() {
        from(remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Messages', extensions: ['json']}]
          })).pipe(
            switchMap((fileNames) => {
                const fileNameToRead = fileNames.filePaths[0];
                if (fileNameToRead) {
                    const callback = bindNodeCallback(fs.readFile)
                    return callback(fileNameToRead, 'utf-8');
                }
                else {
                    return empty;
                }
            }),
            map((fbJson) => {
                return JSON.parse(fbJson);
            })
        ).subscribe((content) => {
            console.log(iconv.decode(iconv.encode(content.messages[0].content), "utf-8"));
        });
    }

    // public get lol() {
    //     return this._lol;
    // }
}