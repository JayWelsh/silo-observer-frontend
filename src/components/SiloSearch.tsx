import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { matchSorter } from 'match-sorter';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useCurrentPath } from '../hooks';
import { API_ENDPOINT, DEPLOYMENT_ID_TO_HUMAN_READABLE, NETWORK_TO_HUMAN_READABLE } from '../constants';
import { ISilo } from '../interfaces';

import { PropsFromRedux } from '../containers/SiloSearchContainer';

interface ISearchableSilo {
  name: string
  symbol: string
  address: string
  network: string
  deployment: string
  deployment_id: string
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
    fetch(`${API_ENDPOINT}/silos?perPage=4320`).then(resp => resp.json())
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
        network: NETWORK_TO_HUMAN_READABLE[silo.network],
        deployment: DEPLOYMENT_ID_TO_HUMAN_READABLE[silo.deployment_id],
        deployment_id: silo.deployment_id,
      })
    }
    setSearchableSilos(searchableSilos);
  }, [siloOverviews])

  //@ts-ignore
  function matchSorterAcrossKeys(list, search, options) {
    //@ts-ignore
    const joinedKeysString = item => options.keys.map(key => item[key]).join(' ')
    return matchSorter(list, search, {
      ...options,
      keys: [...options.keys, joinedKeysString],
    })
  }

  //@ts-ignore
  const filterOptions = (options, { inputValue }) => {return matchSorterAcrossKeys(options, inputValue, {keys: ['name', 'network', 'deployment', 'address']})};

  return (
    <Autocomplete
      // freeSolo
      id="silo-search"
      //@ts-ignore
      onChange={(event: any, newValue: ISearchableSilo) => {
        // setValue(newValue);
        console.log({pathMatch})
        if(newValue.name) {
          if(pathMatch === '/silo/:deploymentID/:tokenSymbol/tvl' || pathMatch === '/') {
            console.log("does navigate");
            navigate(`/silo/${newValue.deployment_id}/${newValue.name}/tvl`)
          } else if (pathMatch === '/silo/:deploymentID/:tokenSymbol/rates') {
            navigate(`/silo/${newValue.deployment_id}/${newValue.name}/rates`)
          }
        }
      }}
      //@ts-ignore
      filterOptions={filterOptions}
      disableClearable
      disabled={searchableSilos?.length > 0 ? false : true}
      options={searchableSilos?.length > 0 ? searchableSilos : []}
      getOptionLabel={(option: ISearchableSilo) => `${option?.name} (${option?.network} - ${option?.deployment})`}
      style={{width: '100%'}}
      autoHighlight
      renderOption={(props, option: ISearchableSilo) => (
        <Box key={`search-${option.address}-${option.symbol}`} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
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
          {option.name} ({option.network} - {option.deployment})
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