export const percentageHandler = (v1, v2) => {
    if (v1 === v2) {
        return 0;
    }
    if (v2 === 0) {
        return 100;
    }
    let percentage = 0.0;
    if (v1 > v2) {
        percentage = ((v1 - v2) / v1) * 100;
    } else {
        percentage = ((v1 - v2) / v2) * 100;
    }
    const value = Math.abs(percentage).toFixed(2) || 0;
    return value;
};

export const convert24hourTo12HourFormat = (time) => {
    const time_part_array = time.split(':');
    let ampm = 'AM';
    if (time_part_array[0] >= 12) {
        ampm = 'PM';
    }
    if (time_part_array[0] > 12) {
        time_part_array[0] = time_part_array[0] - 12;
    }
    const formatted_time = time_part_array[0] + ':' + time_part_array[1] + ':' + time_part_array[2] + ' ' + ampm;
    return formatted_time;
};

export const dateFormatHandler = (dt) => {
    const date = new Date(dt);
    const customDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); //prints expected format.
    return customDate;
};

export const fetchDiffDaysCount = (startDate, endDate) => {
    let Difference_In_Time = endDate.getTime() - startDate.getTime();
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Difference_In_Days.toFixed(0);
};
