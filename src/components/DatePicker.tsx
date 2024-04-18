import React from 'react';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

interface IDatePickerProps {
  label: string;
  value?: string;
  minDate?: string;
  maxDate?: string;
  onChange: (arg0: string) => any;
}

export default function BasicDatePicker(props: IDatePickerProps) {

  let {
    label,
    value,
    minDate,
    maxDate,
    onChange,
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
          if(newValue) {
            console.log({'newValue.toISOString()': newValue.toISOString()});
            onChange(newValue.toISOString());
          }
        }}
        renderInput={(params) => <TextField size="small" disabled={true} style={{width: 140}} {...params} />}
      />
    </LocalizationProvider>
  );
}