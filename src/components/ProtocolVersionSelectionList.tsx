import React, { useState, useEffect, Fragment } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';

import { PropsFromRedux } from '../containers/ProtocolVersionSelectionListContainer';

import { compareArrays } from '../utils';

let lastDebouncedCall: any;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  disableScrollLock: true,
  PaperProps: {
    style: {
      marginTop: 4,
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP,
      width: 180,
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

const protocolVersionSelectionItems = [
  {
    id: "1",
    name: "Silo V1",
    icon: <Avatar style={{width: networkIconSize, height: networkIconSize, border: '1px solid white', marginRight: 8, fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', color: 'white', backgroundColor: 'black'}} alt="V1">V1</Avatar>,
  },
  {
    id: "2",
    name: "Silo V2",
    icon: <Avatar style={{width: networkIconSize, height: networkIconSize, border: '1px solid white', marginRight: 8, fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', color: 'white', backgroundColor: 'black'}} alt="V2">V2</Avatar>,
  },
]

interface IProtocolVersionSelectionList {
  protocolVersionViewListOnly?: boolean
}

export default function ProtocolVersionSelectionList(props: PropsFromRedux & IProtocolVersionSelectionList) {

  let {
    selectedProtocolVersions,
    setSelectedProtocolVersions,
    knownProtocolVersions,
    setKnownProtocolVersions,
    protocolVersionViewListOnly,
  } = props;

  const [localSelectionState, setLocalSelectionState] = useState<string[]>(selectedProtocolVersions);

  const handleChange = (event: SelectChangeEvent<typeof selectedProtocolVersions>) => {
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

  const emitNetworkChange = (arg0: SelectChangeEvent<typeof selectedProtocolVersions>) => {
    const {
      target: { value },
    } = arg0;
    console.log({value, selectedProtocolVersions})
    let arrayValue = typeof value === 'string' ? value.split(',') : value;
    if(!compareArrays(arrayValue, selectedProtocolVersions)) {
      setSelectedProtocolVersions(arrayValue);
    }
  }

  useEffect(() => {
    if(selectedProtocolVersions && knownProtocolVersions) {
      let unknownProtocolVersions = protocolVersionSelectionItems.filter((protocolVersionSelectionItem) => (knownProtocolVersions.indexOf(protocolVersionSelectionItem.id) === -1)).map((protocolVersionSelectionItem) => protocolVersionSelectionItem.id);
      if(unknownProtocolVersions?.length > 0) {
        let newSelection = [...new Set([...selectedProtocolVersions, ...unknownProtocolVersions])];
        setSelectedProtocolVersions(newSelection);
        setLocalSelectionState(newSelection)
        setKnownProtocolVersions(protocolVersionSelectionItems.map((protocolVersionSelectionItem) => protocolVersionSelectionItem.id));
      }
    }
  }, [knownProtocolVersions, selectedProtocolVersions, setSelectedProtocolVersions, setKnownProtocolVersions])

  return (
    <div>
      {!protocolVersionViewListOnly &&
        <FormControl sx={{ m: 1, width: 100 }} size="small">
          <InputLabel id="demo-multiple-checkbox-label">Versions</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={localSelectionState}
            onChange={handleChange}
            input={<OutlinedInput label="Versions" />}
            color="primary"
            // renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, paddingTop: "4px", paddingBottom: "2px" }}>
                {selected.map((value, index) => (
                  <Fragment key={`deployment-id-selection-entry-${index}`}>
                    {/* <img src={networkIdToImage[value]} style={{width: networkIconSize, height: networkIconSize, marginLeft: (index > 0) ? "-10px" : 0}} alt={`${value}`} /> */}
                    <Avatar style={{width: networkIconSize, height: networkIconSize,  marginLeft: (index > 0) ? "-10px" : 0, fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', color: 'white', backgroundColor: 'black', border: '1px solid white'}} alt={`V${{value}}`}>V{value}</Avatar>
                  </Fragment>
                ))}
              </Box>
            )}
          >
            {protocolVersionSelectionItems.map(({name, icon, id}) => (
              <MenuItem key={id} value={id}>
                <Checkbox checked={localSelectionState.indexOf(id) > -1} disabled={localSelectionState.length === 1} />
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      {protocolVersionViewListOnly &&
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, paddingTop: "4px", paddingBottom: "2px" }}>
          {selectedProtocolVersions.map((value, index) => (
            <Fragment key={`deployment-id-selection-view-only-entry-${index}`}>
              {value}
              {/* <img src={networkIdToImage[value]} style={{width: networkIconSize, height: networkIconSize, marginLeft: (index > 0) ? "-10px" : 0}} alt={`${value}`} /> */}
            </Fragment>
          ))}
        </Box>
      }
    </div>
  );
}