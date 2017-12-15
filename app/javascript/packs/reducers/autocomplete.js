import * as types from '../constants/action_types'

const initialState = {
  search_results: [],
  top_list: [],
  fetchStatus: "",
  loading: true,
  filterBy: "",
  choice: "",
  team_id: null,
}

export default function autocomplete(state = initialState, action) {
  switch (action.type) {
    case types.LOAD_USERS:
      return {
        ...state,
        fetchStatus: "Loading Top List... ",
        top_list: [],
        loading: true,
      };
    case types.LOAD_USERS_FULFILLED:
      return {
        ...state,
        top_list: action.payload,
        loading: false,
        fetchStatus: "",
      }
    case types.SEARCH_USERS:
      return {
        ...state,
        fetchStatus: `fetching... ${(new Date()).toLocaleString()}`,
        filterBy: action.by,
        choice: action.by,
        search_results: [],
        loading: true,
      };
    case types.SELECT_SKATER:
      return {
        ...state,
        choice: _.titleize(action.choice),
        team_id: action.location,
        search_results: [],
      }
    case types.DRAFT_SKATER:
      return {
        ...state,
        choice: action.choice,
      }
    case types.CLEAR_SEARCH:
       return {
         ...state,
         choice: "",
         search_results: [],
         loading: false,
         fetchStatus: "",
       }
    case types.SEARCH_USERS_FULFILLED:
      return {
        ...state,
        search_results: action.payload,
        loading: false,
        fetchStatus: `Results from ${(new Date()).toLocaleString()}`
      };
    case types.SEARCH_USERS_REJECTED:
      return {
        ...state,
        loading: false,
        fetchStatus: `errored: ${action.payload}`
      };

    case 'ERROR_GENERATED':
      return action
    default:
      return state
  }
}
