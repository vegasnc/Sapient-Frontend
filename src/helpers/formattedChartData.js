import { DateRangeStore } from '../store/DateRangeStore';
import React, { useState, useEffect } from 'react';

export const getFormattedTimeIntervalData = (data, startDate, endDate) => {
    //console.log(data);
    // Defs
    // m1 = "Start date" Month value
    // d1 = "Start date" Date value
    // mon1 = Month
    // dt1 = Date
    // sd = Start Date
    // sdf = Start Date Format
    // nsd = New Start Date
    // st = Start Time

    // m2 = "End date" Month value
    // d2 = "End date" Date value
    // mon2 = Month
    // dt2 = Date
    // ed = End Date
    // edf = End Date Format
    // ned = New End Date
    // et = End Time

    // tsd = Timestampdata
    // ntsd = New Timestampdata

    let sd = startDate.toLocaleDateString()
    let sdf = new Date(startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + (startDate.getDate()));
    //console.log(sdf)
    let m1 = sdf.getMonth() + 1;
    let d1 = sdf.getDate();
    let mon1 = m1 < 10 ? "0" + m1 : m1;
    let dt1 = d1 < 10 ? "0" + d1 : d1
    let nsd = sdf.getFullYear() + "-" + mon1 + "-" + dt1 + "T00:00:00.000Z"
    //console.log(nsd);
    let startTime = new Date(nsd);
    let st = startTime.getTime();
    //console.log(st);
    let ed = endDate.toLocaleDateString()
    let edf = new Date(endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + (endDate.getDate() + 1));
    let m2 = edf.getMonth() + 1;
    let d2 = edf.getDate() + 1;
    let mon2 = m2 < 10 ? "0" + m2 : m2;
    let dt2 = d2 < 10 ? "0" + d2 : d2
    let ned = edf.getFullYear() + "-" + mon2 + "-" + dt2 + "T00:00:00.000Z"
    let endTime = new Date(ned);
    let et = endTime.getTime();
    //console.log(et);
    let newArr = [];
    for (let i = st, j = 1; i <= et; i += 900000) {
        let tsd = new Date();
        if (data[j] !== undefined)
            tsd = new Date(data[j][0]);
        if (tsd.getTime() === i) {
            let ntsd = new Date(i);
            newArr.push([ntsd, data[j][1]])
            j++;
        }
        else {
            let ntsd = new Date(i);
            newArr.push([ntsd, null])
        }
    }
    return newArr;
}

export const getFormattedTimeIntervalObjectData = (data, startDate, endDate) => {

    let newDataSet = [];
    let newdata = data[0].data;
    //Code Commented due to still in development

    let sd = startDate.toLocaleDateString()
    let sdf = new Date(sd);
    let m1 = sdf.getMonth() + 1;
    // let d1 = sdf.getDate();
    // let mon1 = m1 < 10 ? "0" + m1 : m1;
    // let dt1 = d1 < 10 ? "0" + d1 : d1
    // let nsd = sdf.getFullYear() + "-" + mon1 + "-" + dt1 
    // let startTime = new Date(nsd);
    let st = sdf.getTime();

    let ed = endDate.toLocaleDateString()
    let edf = new Date(endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + (endDate.getDate() + 1));
    // let m2 = edf.getMonth() + 1;
    // let d2 = edf.getDate() + 1;
    // let mon2 = m2 < 10 ? "0" + m2 : m2;
    // let dt2 = d2 < 10 ? "0" + d2 : d2
    // let ned = edf.getFullYear() + "-" + mon2 + "-" + dt2 + "T00:00:00.000Z"
    // let endTime = new Date(ned);
    let et = edf.getTime();

    let newArr = [];
    for (let i = st, j = 1; i <= et; i += 900000) {
        let tsd = new Date();
        if (newdata[j] !== undefined)
            tsd = new Date(newdata[j].x);
        if (tsd.getTime() === i) {
            let ntsd = new Date(i);
            newArr.push({ "x": ntsd.getTime(), "y": newdata[j].y })
            j++;
        }
        else {
            let ntsd = new Date(i);
            newArr.push({ "x": ntsd.getTime(), "y": "" })
        }
    }
    newDataSet.push({ name: "Energy", data: newArr })
    return newDataSet;
}