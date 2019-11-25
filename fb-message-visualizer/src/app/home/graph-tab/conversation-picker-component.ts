import {GraphMessageProvider, MessageProvider} from "../../core/services";
import {Component} from "@angular/core";

@Component({
  selector: 'conversation-picker',
  templateUrl: './conversation-picker-component.html',
})
export class ConversationPickerComponent {
  constructor(public _messageProvider: MessageProvider,
              public _graphMessageProvider: GraphMessageProvider) {}
}
