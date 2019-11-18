import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NgbDateStruct, NgbDate } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'date-picker',
    templateUrl: './date-picker-component.html',
    styleUrls: ['./date-picker-component.scss']
  })
export class DatePickerComponent {
    @Input() minDate: NgbDateStruct
    @Input() maxDate: NgbDateStruct
    @Input() date: NgbDateStruct
    @Input() label: string
    @Output() dateChange: EventEmitter<NgbDateStruct> = new EventEmitter()

    onDateChange(newDate: NgbDateStruct) {
        this.date = newDate;
        this.dateChange.emit(newDate);
    }
}