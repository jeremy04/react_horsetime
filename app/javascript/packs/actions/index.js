import * as types from '../constants/action_types'
import { createLogic, createLogicMiddleware } from 'redux-logic'
import axios from 'axios'

function loadUsersFulfilled(users) { return { type: types.LOAD_USERS_FULFILLED, payload: users }; }
function searchUsersFulfilled(users) {return { type: types.SEARCH_USERS_FULFILLED, payload: users }; }
function searchUsersRejected(err) { return { type: types.SEARCH_USERS_REJECTED, payload: err, error: true }; }
function draftSkaterFulfilled(skater) { return { type: types.DRAFT_SKATER_FULFILLED, payload: skaters }; }
function draftSkaterRejected(err) { 
  let errs = _.map(err, function(key, value) { return Object.values(key).join(""); });
  return { type: types.DRAFT_SKATER_REJECTED, payload: errs, error: true }; 
}
function hasPlayer(players, choice) { 
  return _.find(players, { name: _.lowerCase(choice) } ) 
}
function clearSearch() { return { type: types.CLEAR_SEARCH }; }

export const draftSkaterLogic = createLogic({
  type: types.DRAFT_SKATER,
  latest: true,
  validate({ getState, action }, allow, reject) {
    let appState = getState();
    if ( hasPlayer(appState.top_list, action.choice) ) {
      allow(action);
    } else {
      reject(draftSkaterRejected( { errors: ["Player not found"]  }  ) );
    }
  },
  async process({ httpClient, getState, action }, dispatch, done) {
    try {
      const roomCode = function() {
        const uri = location.hash.slice(1);
        return uri;
      };

      let headers = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'        
        }
      };

      let appState = getState();
      let team_id = hasPlayer(appState.top_list, action.choice).location

      const skater =
        await httpClient.post(`/api/v1/rooms/${roomCode()}/skaters/draft`, 
          { choice: action.choice, team: team_id }, 
          headers)
        .then(resp => resp.data);
      if (skater.success) {  
        dispatch(draftSkaterFulfilled(users));
      }
      else {
        dispatch(draftSkaterRejected(skater.errors));
      }
    } catch(err) {
      console.error(err);
      // dispatch error here?
    }
    done();
  }
})


export const loadUsersLogic = createLogic({
  type: types.LOAD_USERS,
  latest: true,
  async process({ httpClient, getState, action }, dispatch, done) {
    try {
      const roomCode = function() {
        const uri = location.hash.slice(1);
        return uri;
      };

      let headers = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'        
        }
      };
      const users =
        await httpClient.get(`/api/v1/rooms/${roomCode()}/skaters/season_stats`, headers)
          .then(resp => resp.data.skaters);
          dispatch(loadUsersFulfilled(users));
        } catch(err) {
          console.error(err);
          dispatch(searchUsersRejected(err));
        }
    done();
  }
})

export const usersFetchLogic = createLogic({
  type: [types.SEARCH_USERS],
 // debounce: 250,
  latest: true, // take latest only
  
  validate({ getState, action }, allow, reject) {
    if (action.by) {
      allow(action);
    } else { // empty request, silently reject
      console.log("Empty request for action");
      reject(clearSearch());
    }
  },
  async process({ httpClient, getState, action }, dispatch, done) {
      try {
        const roomCode = function() {
          const uri = location.hash.slice(1);
          return uri;
        };

        let headers = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'        
          }
        };

        const users =
          await httpClient.get(`/api/v1/rooms/${roomCode()}/skaters/season_stats`, headers)
            .then(resp => resp.data.skaters);
        dispatch(searchUsersFulfilled(users));
      } catch(err) {
        console.error(err);
        dispatch(searchUsersRejected(err));
      }
      done();
  }
});

