import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useCurrentPath } from '../hooks';
import { API_ENDPOINT } from '../constants';
import { ISilo } from '../interfaces';

import { PropsFromRedux } from '../containers/SiloSearchContainer';

interface ISearchableSilo {
  name: string
  symbol: string
  address: string
}

interface ISiloSearchProps {
  siloOverviews: ISilo[]
}

export default function SiloSearch(props: PropsFromRedux & ISiloSearchProps) {
  const [searchableSilos, setSearchableSilos] = useState<ISearchableSilo[]>([]);

  let {
    siloOverviews,
    setSiloOverviews,
  } = props;

  let navigate = useNavigate();
  const pathMatch = useCurrentPath();
  
  useEffect(() => {
    fetch(`${API_ENDPOINT}/silos?perPage=1440`).then(resp => resp.json())
    .then(response => {
      if(response?.data?.length > 0) {
        setSiloOverviews(response?.data);
      } else {
        setSiloOverviews([]);
      }
    })
  }, [setSiloOverviews])

  useEffect(() => {
    let searchableSilos = [];
    for(let silo of siloOverviews) {
      searchableSilos.push({
        name: silo.name,
        symbol: silo.name,
        address: silo.address,
      })
    }
    setSearchableSilos(searchableSilos);
  }, [siloOverviews])

  return (
    <Autocomplete
      // freeSolo
      id="silo-search"
      //@ts-ignore
      onChange={(event: any, newValue: ISearchableSilo) => {
        // setValue(newValue);
        if(newValue.name) {
          if(pathMatch === '/silo/:tokenSymbol/tvl' || pathMatch === '/') {
            navigate(`/silo/${newValue.name}/tvl`)
          } else if (pathMatch === '/silo/:tokenSymbol/rates') {
            navigate(`/silo/${newValue.name}/rates`)
          }
        }
      }}
      disableClearable
      disabled={searchableSilos?.length > 0 ? false : true}
      options={searchableSilos?.length > 0 ? searchableSilos : []}
      getOptionLabel={(option) => option.name}
      style={{width: '100%'}}
      autoHighlight
      renderOption={(props, option: ISearchableSilo) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <img
            loading="lazy"
            width="20"
            src={`https://app.silo.finance/images/logos/${option.symbol}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg";
            }}
            alt=""
          />
          {option.name}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={searchableSilos?.length > 0 ? "Silo Search" : "Loading..."}
          // variant="standard"
          InputProps={{
            ...params.InputProps,
            type: 'search',
          }}
        />
      )}
    />
  );
}