import React, { useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';

import EthereumLogo from '../assets/png/ethereum-logo.png';
import ArbitrumLogo from '../assets/svg/arbitrum-logo.png';
import { PropsFromRedux } from '../containers/NetworkSelectionListContainer';

import { compareArrays } from '../utils';

let lastDebouncedCall: any;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  disableScrollLock: true,
  PaperProps: {
    style: {
      marginTop: 4,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
  MenuListProps: {
    style: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  }
};

let networkIconSize = 25;

let networkIdToImage : {[key: string]: string} = {
  "ethereum": EthereumLogo,
  "arbitrum": ArbitrumLogo,
}

const networkSelectionItems = [
  {
    id: "ethereum",
    name: "Ethereum",
    icon: <img src={networkIdToImage["ethereum"]} style={{width: networkIconSize, height: networkIconSize, marginRight: 8}} alt="Ethereum" />,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    icon: <img src={networkIdToImage["arbitrum"]} style={{width: networkIconSize, height: networkIconSize, marginRight: 8}} alt="Arbitrum" />,
  }
]

export default function NetworkSelectionList(props: PropsFromRedux) {

  let {
    selectedNetworkIDs,
    setSelectedNetworkIDs,
  } = props;

  const [localSelectionState, setLocalSelectionState] = useState<string[]>(selectedNetworkIDs);

  const handleChange = (event: SelectChangeEvent<typeof selectedNetworkIDs>) => {
    const {
      target: { value },
    } = event;
    if(value.length > 0) {
      setLocalSelectionState(typeof value === 'string' ? value.split(',') : value)
      if (lastDebouncedCall) {
        clearTimeout(lastDebouncedCall);
      }
  
      // Schedule a new debounced call
      lastDebouncedCall = setTimeout(() => emitNetworkChange(event), 800);
    }
  };

  const emitNetworkChange = (arg0: SelectChangeEvent<typeof selectedNetworkIDs>) => {
    const {
      target: { value },
    } = arg0;
    console.log({value, selectedNetworkIDs})
    let arrayValue = typeof value === 'string' ? value.split(',') : value;
    if(!compareArrays(arrayValue, selectedNetworkIDs)) {
      setSelectedNetworkIDs(arrayValue);
    }
  }

  return (
    <div>
      <FormControl sx={{ m: 1, width: 120 }} size="small">
        <InputLabel id="demo-multiple-checkbox-label">Chains</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={localSelectionState}
          onChange={handleChange}
          input={<OutlinedInput label="Chains" />}
          color="primary"
          // renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, paddingTop: "4px", paddingBottom: "2px" }}>
              {selected.map((value, index) => (
                <>
                  {(index > 0) && "+"}
                  <img src={networkIdToImage[value]} style={{width: networkIconSize, height: networkIconSize}} alt={`${value}`} />
                </>
              ))}
            </Box>
          )}
        >
          {networkSelectionItems.map(({name, icon, id}) => (
            <MenuItem key={id} value={id}>
              <Checkbox checked={localSelectionState.indexOf(id) > -1} disabled={localSelectionState.length === 1} />
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}