import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

dayjs.extend(utc);
interface IDatePickerProps {
  label: string;
  value?: string;
  minDate?: string;
  maxDate?: string;
  onChange: (arg0: string) => any;
  mode: "start" | "end";
}

export default function BasicDatePicker(props: IDatePickerProps) {

  let {
    label,
    value,
    minDate,
    maxDate,
    onChange,
    mode,
  } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileDatePicker
        inputFormat="MMM D YYYY"
        label={label}
        value={value ? dayjs(value) : null}
        minDate={dayjs(minDate)}
        maxDate={dayjs(maxDate)}
        onChange={(newValue) => {
          // if(newValue) {
          //   onChange(newValue.toISOString());
          // }
          if (newValue) {
            if (mode === 'start' && newValue.isSame(dayjs(minDate), 'day')) {
              onChange(dayjs(minDate).toISOString());
            } else if (mode === 'end' && newValue.isSame(dayjs(maxDate), 'day')) {
              onChange(dayjs(maxDate).toISOString());
            } else {
              const adjustedValue = newValue.utc().set('hour', 0).set('minute', 0).set('second', 0);
              onChange(adjustedValue.toISOString());
            }
          }
        }}
        renderInput={(params) => <TextField size="small" disabled={true} style={{width: 150}} {...params} />}
      />
    </LocalizationProvider>
  );
}