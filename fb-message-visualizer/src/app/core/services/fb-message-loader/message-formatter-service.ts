import { SingleDataSet } from "ng2-charts";
import * as moment from 'moment';
import _ from "lodash";
import { ChartPoint } from "chart.js";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class MessageFormatterService {
    public static YEAR_FORMATTER: UnitFormatter = {
        unit: 'year',
        groupByFunction: (dateString: string) => moment(dateString).year().toString(),
        toDate: (unitString: string) => new Date(unitString)
    };
    public static QUARTER_FORMATTER: UnitFormatter = {
        unit: 'quarter',
        groupByFunction: (dateString: string) => {
            const dateMoment: moment.Moment = moment(dateString);
            return `${dateMoment.quarter().toString()} ${dateMoment.year().toString()}`;
        },
        toDate: (unitString: string) => {
            const units: string[] = unitString.split(' ');
            return moment().quarter(Number(units[0])).year(Number(units[1])).toDate();
        }
    };
    public static MONTH_FORMATTER: UnitFormatter = {
        unit: 'month',
        groupByFunction: (dateString: string) => {
            const dateMoment: moment.Moment = moment(dateString);
            return `${dateMoment.month().toString()} ${dateMoment.year().toString()}`;
        },
        toDate: (unitString: string) => {
            const units: string[] = unitString.split(' ');
            return moment().date(1).month(Number(units[0])).year(Number(units[1])).toDate();
        }
    };
    public static WEEK_FORMATTER: UnitFormatter = {
        unit: 'week',
        groupByFunction: (dateString: string) => {
            const dateMoment: moment.Moment = moment(dateString);
            return `${dateMoment.isoWeek().toString()} ${dateMoment.year()}`
        },
        toDate: (unitString: string) => {
            const units: string[] = unitString.split(' ');
            return moment().isoWeekYear(Number(units[1])).isoWeek(Number(units[0])).toDate();
        }
    };
    public static DAY_FORMATTER: UnitFormatter = {
        unit: 'day',
        groupByFunction: (dateString: string) => dateString,
        toDate: (unitString: string) => new Date(unitString)
    };

    public getSeparatedDates(
        dates: {}, 
        startDate: string, 
        endDate: string, 
        useTotal: boolean,
        numberOfTicks: number,
        participantsToProcess: string[]): {
        dataset: Array<{data: SingleDataSet, label: string}>,
        unit: string
    } {
        const formatter: UnitFormatter = this._getUnitFormatters(startDate, endDate, numberOfTicks);
        const unitMapsWithLabels: Array<{unitMap: Map<string, number>, label: string}> = 
            participantsToProcess.map((participant: string) => {
                return {
                    unitMap: this._populateUnitMap([participant], formatter, dates, startDate, endDate),
                    label: participant
                };
            });
        
        const filteredUnitMapsWithLabels= unitMapsWithLabels.filter((unitMapWithLabel) => {
            return unitMapWithLabel.unitMap.size > 0
        });

        const dataset: Array<{data: SingleDataSet, label: string}> =  
            filteredUnitMapsWithLabels.map((unitMapWithLabel) => {
                return {
                    data: this._populateDataSet(unitMapWithLabel.unitMap, formatter, useTotal),
                    label: unitMapWithLabel.label
                };
            });
        return {dataset: dataset, unit: formatter.unit};
    }

    public getTotalDates(
        dates: {}, 
        startDate: string, 
        endDate: string, 
        useTotal: boolean,
        numberOfTicks: number,
        participantsToProcess: string[]): {
        dataset: Array<{data: SingleDataSet, label: string}>,
        unit: string
    } {
        const formatter: UnitFormatter = this._getUnitFormatters(startDate, endDate, numberOfTicks);
        const unitMap: Map<string, number> = this._populateUnitMap(participantsToProcess, formatter, dates, startDate, endDate);
        const totalDates: Array<ChartPoint> = this._populateDataSet(unitMap, formatter, useTotal);
        return {dataset: [{data: totalDates, label: 'Total'}], unit: formatter.unit};
    }

    private _populateDataSet(unitMap: Map<string, number>, formatter: UnitFormatter, useTotal: boolean): Array<ChartPoint> {
        const units: Array<string> = this._getSortedUnits(unitMap, formatter);
        const totalDates: Array<ChartPoint> = [];

        if (useTotal) {
            let prev: number = unitMap.get(units[0]);
            units.forEach((unit: string) => {
                const numberOfTimesUsed: number = unitMap.get(unit);
                const timeToUse: Date = formatter.toDate(unit);
                totalDates.push({
                  t: timeToUse,
                  y: prev + numberOfTimesUsed
                })
                prev += numberOfTimesUsed;
              });
        } else {
            units.forEach((unit: string) => {
                const numberOfTimesUsed: number = unitMap.get(unit);
                const timeToUse: Date = formatter.toDate(unit);
                totalDates.push({
                  t: timeToUse,
                  y: numberOfTimesUsed
                })
              });
        }
        
        return totalDates;
    }

    private _populateUnitMap(
        participants: string[], 
        formatter: UnitFormatter,
        dates: {},
        startDate: string,
        endDate: string): Map<string, number> {
            const unitMap: Map<string, number> = new Map();
            participants.forEach((name: string) => {
                if (dates.hasOwnProperty(name)) {
                    let datesUsed: Array<string> = Object.keys(dates[name]);
                    datesUsed = datesUsed.filter((dateString: string) => {
                        return moment(dateString).isBetween(startDate, endDate, null, "[]");
                    })
                    const datesUsedGroupedByUnits: object = _.groupBy(datesUsed, formatter.groupByFunction);
                    const units = Object.keys(datesUsedGroupedByUnits);
                    units.forEach((unit: string) => {
                    const allTimesInMonth: number = datesUsedGroupedByUnits[unit].reduce(
                        (accum: number, dateString: string) => {
                            return accum + dates[name][dateString]
                    }, 0)
                    let numberOfTimesUsed: number = unitMap.get(unit);
                    numberOfTimesUsed = numberOfTimesUsed ? numberOfTimesUsed : 0;
                    unitMap.set(unit, numberOfTimesUsed + allTimesInMonth);
                    }); 
                }
            });
            return unitMap;
    }
    
    private _getSortedUnits(unitMap: Map<string, number>, formatter: UnitFormatter): string[] {
        let units = Array.from(unitMap.keys());
        units.sort((a: string, b: string) => {
          let dateA = formatter.toDate(a);
          let dateB = formatter.toDate(b);
          if (dateA.getTime() > dateB.getTime()) {
            return 1;
          } else if (dateA.getTime() < dateB.getTime()) {
            return -1;
          } else {
            return 0;
          }
        });
        return units;
    }

    // returns functions that formats datestrings to optimal unit (year, month, week, or day)
    private _getUnitFormatters(
        startDate: string, 
        endDate: string, 
        numberOfTicks: number): UnitFormatter {
        const startDateAsMoment: moment.Moment = moment(startDate);
        const endDateAsMoment: moment.Moment = moment(endDate);
        const yearDiff: number = endDateAsMoment.diff(startDateAsMoment, 'year');
        const quarterDiff: number = endDateAsMoment.diff(startDateAsMoment, 'quarter');
        const monthDiff: number = endDateAsMoment.diff(startDateAsMoment, 'month');
        const weekDiff: number = endDateAsMoment.diff(startDateAsMoment, 'week');
        const dayDiff: number = endDateAsMoment.diff(startDateAsMoment, 'day');

        const yearDiffWithFormatter = {
            dateFormatter: MessageFormatterService.YEAR_FORMATTER,
            diff: yearDiff
        };
        const quarterDiffWithFormatter = {
            dateFormatter: MessageFormatterService.QUARTER_FORMATTER,
            diff: quarterDiff
        };
        const monthDiffWithFormatter = {
            dateFormatter: MessageFormatterService.MONTH_FORMATTER,
            diff: monthDiff
        };
        const weekDiffWithFormatter = {
            dateFormatter: MessageFormatterService.WEEK_FORMATTER,
            diff: weekDiff
        };
        const dayDiffWithFormatter = {
            dateFormatter: MessageFormatterService.DAY_FORMATTER,
            diff: dayDiff
        };

        const formattersWithDiffs = [
            yearDiffWithFormatter, 
            quarterDiffWithFormatter, 
            monthDiffWithFormatter, 
            weekDiffWithFormatter, 
            dayDiffWithFormatter
        ];
        
        const closestFormatter = formattersWithDiffs.reduce((closestDateFormatter, currentFormatter) => {
            if (currentFormatter.diff > numberOfTicks - 2 && Math.abs(currentFormatter.diff - numberOfTicks) < Math.abs(closestDateFormatter.diff - numberOfTicks)) {
                return currentFormatter;
            } else {
                return closestDateFormatter;
            }
        }, monthDiffWithFormatter)
        
        return closestFormatter.dateFormatter;
    }
}

interface UnitFormatter {
    unit: string, 
    groupByFunction: (dateString: string) => string,
    toDate: (unitString: string) => Date
}