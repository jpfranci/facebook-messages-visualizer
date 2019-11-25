import {Injectable} from "@angular/core";
import * as fs from 'fs';
import {remote} from "electron";

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {
  fs: typeof fs;

  public saveGraphImage(data: string) {
    let path = remote.dialog.showSaveDialog({
      filters: [{name: 'Image', extensions: ['png']}]
    });

    if (path) {
      const dataToEncoded: string = data.replace(/^data:image\/png;base64,/, "");
      fs.writeFile(path, dataToEncoded, "base64", (err) => {
        console.log(err);
      });
    }
  }

  public saveCSV(data: string) {
    let path = remote.dialog.showSaveDialog({
      filters: [{name: 'Excel File', extensions: ['csv']}]
    });

    if (path) {
      fs.writeFile(path, data, 'utf-8', (err) => {
        console.log(err);
      });
    }
  }
}
