import { Component, Input, Output, EventEmitter, SimpleChanges, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'filter-participants',
    templateUrl: './filter-participants-component.html',
    styleUrls: ['filter-participants-component.scss']
  })
export class FilterParticipantsComponent {
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
    @Input() participants: Array<string>;
    @Output() onSelectParticipants: EventEmitter<Array<string>> = new EventEmitter();
    private _participantsBuffer: Array<string>;

    showModal() {
        if (this._participantsBuffer === undefined && this.participants) {
            this._participantsBuffer = this.participants.slice();
        }
        this.modal.show();
    }

    private _onSelectAll() {
        this._participantsBuffer = this.participants.slice();
    }

    private _onUnselectAll() {
        this._participantsBuffer = [];
    }

    private _onParticipantClick(participant: string): void {
        if (this._participantsBuffer.includes(participant)) {
            this._participantsBuffer = this._participantsBuffer.filter(oParticipant => oParticipant !== participant);
        } else {
            this._participantsBuffer.push(participant);
        }
    }

    private _onModalHide() {
        this.onSelectParticipants.emit(this._participantsBuffer);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.participants) {
            this._participantsBuffer = changes.participants.currentValue.slice();
        }
    }
}