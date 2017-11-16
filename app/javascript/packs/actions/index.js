import * as types from '../constants/action_types'
import { createLogic, createLogicMiddleware } from 'redux-logic'
import axios from 'axios'

function loadUsersFulfilled(users) { return { type: types.LOAD_USERS_FULFILLED, payload: users }; }
function searchUsersFulfilled(users) {return { type: types.SEARCH_USERS_FULFILLED, payload: users }; }
function searchUsersRejected(err) { return { type: types.SEARCH_USERS_REJECTED, payload: err, error: true }; }
function clearSearch() { return { type: types.CLEAR_SEARCH }; }

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

