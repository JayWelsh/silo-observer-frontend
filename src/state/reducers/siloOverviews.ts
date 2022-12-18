import {
  ISilo
} from '../../interfaces'

interface ISiloOverviewsReducer {
  type: string;
  siloOverviews: ISilo[]
}

const siloOverviews = (state = [], action: ISiloOverviewsReducer) => {
  switch (action.type) {
    case 'SET_SILO_OVERVIEWS':
      return action.siloOverviews
    default:
      return state
  }
}

export default siloOverviews;