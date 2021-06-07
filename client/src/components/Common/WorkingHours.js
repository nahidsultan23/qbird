import React from 'react'
import { titleCase } from 'title-case';

const WorkingHours = ({ openingHours, midBreaks }) => {

    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th></th>
                    <th className="text-center" colSpan="2">Open</th>
                    <th className="text-center" colSpan="2">Break</th>
                </tr>
                <tr>
                    <th>Day</th>
                    <th className="text-center">From</th>
                    <th className="text-center">To</th>
                    <th className="text-center">From</th>
                    <th className="text-center">To</th>
                </tr>
            </thead>
            <tbody>
                {mergeAndRenderTimings(openingHours, midBreaks)}
            </tbody>
        </table>
    )
}

const mergeAndRenderTimings = (openingHours, midBreaks) => {
    let timings = {
        sunday: {},
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {}
    };
    if (openingHours && openingHours.hasOwnProperty('everyday')) {
        // sunday
        timings = {
            ...timings, sunday: {
                ...timings.sunday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
        // monday
        timings = {
            ...timings, monday: {
                ...timings.monday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
        // tuesday
        timings = {
            ...timings, tuesday: {
                ...timings.tuesday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
        // wednesday
        timings = {
            ...timings, wednesday: {
                ...timings.wednesday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
        // thursday
        timings = {
            ...timings, thursday: {
                ...timings.thursday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
        // friday
        timings = {
            ...timings, friday: {
                ...timings.friday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
        // saturday
        timings = {
            ...timings, saturday: {
                ...timings.saturday,
                timeFrom: openingHours['everyday'].from,
                timeTo: openingHours['everyday'].to
            }
        };
    } else {
        timings = {
            ...timings,
            sunday: {
                ...timings.sunday,
                timeFrom: openingHours && openingHours.hasOwnProperty('sunday') ? openingHours.sunday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('sunday') ? openingHours.sunday.to : ' - '
            }, monday: {
                ...timings.monday,
                timeFrom: openingHours && openingHours.hasOwnProperty('monday') ? openingHours.monday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('monday') ? openingHours.monday.to : ' - '
            }, tuesday: {
                ...timings.tuesday,
                timeFrom: openingHours && openingHours.hasOwnProperty('tuesday') ? openingHours.tuesday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('tuesday') ? openingHours.tuesday.to : ' - '
            }, wednesday: {
                ...timings.wednesday,
                timeFrom: openingHours && openingHours.hasOwnProperty('wednesday') ? openingHours.wednesday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('wednesday') ? openingHours.wednesday.to : ' - '
            }, thursday: {
                ...timings.thursday,
                timeFrom: openingHours && openingHours.hasOwnProperty('thursday') ? openingHours.thursday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('thursday') ? openingHours.thursday.to : ' - '
            }, friday: {
                ...timings.friday,
                timeFrom: openingHours && openingHours.hasOwnProperty('friday') ? openingHours.friday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('friday') ? openingHours.friday.to : ' - '
            }, saturday: {
                ...timings.saturday,
                timeFrom: openingHours && openingHours.hasOwnProperty('saturday') ? openingHours.saturday.from : ' - ',
                timeTo: openingHours && openingHours.hasOwnProperty('saturday') ? openingHours.saturday.to : ' - '
            }
        };
    }
    if (midBreaks && midBreaks.everyday && midBreaks.everyday.from && midBreaks.everyday.to) {
        // sunday
        timings = {
            ...timings, sunday: {
                ...timings.sunday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
        // monday
        timings = {
            ...timings, monday: {
                ...timings.monday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
        // tuesday
        timings = {
            ...timings, tuesday: {
                ...timings.tuesday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
        // wednesday
        timings = {
            ...timings, wednesday: {
                ...timings.wednesday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
        // thursday
        timings = {
            ...timings, thursday: {
                ...timings.thursday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
        // friday
        timings = {
            ...timings, friday: {
                ...timings.friday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
        // saturday
        timings = {
            ...timings, saturday: {
                ...timings.saturday,
                breakFrom: midBreaks['everyday'].from,
                breakTo: midBreaks['everyday'].to
            }
        };
    } else {
        timings = {
            ...timings, sunday: {
                ...timings.sunday,
                breakFrom: midBreaks && midBreaks.sunday && midBreaks.hasOwnProperty('sunday') ? midBreaks.sunday.from : ' - ',
                breakTo: midBreaks && midBreaks.sunday && midBreaks.hasOwnProperty('sunday') ? midBreaks.sunday.to : ' - '
            }, monday: {
                ...timings.monday,
                breakFrom: midBreaks && midBreaks.monday && midBreaks.hasOwnProperty('monday') ? midBreaks.monday.from : ' - ',
                breakTo: midBreaks && midBreaks.monday && midBreaks.hasOwnProperty('monday') ? midBreaks.monday.to : ' - '
            }, tuesday: {
                ...timings.tuesday,
                breakFrom: midBreaks && midBreaks.tuesday && midBreaks.hasOwnProperty('tuesday') ? midBreaks.tuesday.from : ' - ',
                breakTo: midBreaks && midBreaks.tuesday && midBreaks.hasOwnProperty('tuesday') ? midBreaks.tuesday.to : ' - '
            }, wednesday: {
                ...timings.wednesday,
                breakFrom: midBreaks && midBreaks.wednesday && midBreaks.hasOwnProperty('wednesday') ? midBreaks.wednesday.from : ' - ',
                breakTo: midBreaks && midBreaks.wednesday && midBreaks.hasOwnProperty('wednesday') ? midBreaks.wednesday.to : ' - '
            }, thursday: {
                ...timings.thursday,
                breakFrom: midBreaks && midBreaks.thursday && midBreaks.hasOwnProperty('thursday') ? midBreaks.thursday.from : ' - ',
                breakTo: midBreaks && midBreaks.thursday && midBreaks.hasOwnProperty('thursday') ? midBreaks.thursday.to : ' - '
            }, friday: {
                ...timings.friday,
                breakFrom: midBreaks && midBreaks.friday && midBreaks.hasOwnProperty('friday') ? midBreaks.friday.from : ' - ',
                breakTo: midBreaks && midBreaks.friday && midBreaks.hasOwnProperty('friday') ? midBreaks.friday.to : ' - '
            }, saturday: {
                ...timings.saturday,
                breakFrom: midBreaks && midBreaks.saturday && midBreaks.hasOwnProperty('saturday') ? midBreaks.saturday.from : ' - ',
                breakTo: midBreaks && midBreaks.saturday && midBreaks.hasOwnProperty('saturday') ? midBreaks.saturday.to : ' - '
            },
        };
    }
    return Object.keys(timings).map((keyName, i) => {
        return (
            <tr key={keyName}>
                <td className="text-left">{titleCase(keyName)}</td>
                <td className="text-center">{timings[keyName].timeFrom}</td>
                <td className="text-center">{timings[keyName].timeTo}</td>
                <td className="text-center">{timings[keyName].breakFrom}</td>
                <td className="text-center">{timings[keyName].breakTo}</td>
            </tr>
        )
    })
}

export default WorkingHours;