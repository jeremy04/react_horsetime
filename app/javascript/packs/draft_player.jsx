// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, bindActionCreators } from 'redux'
import _ from 'lodash'
_.mixin(require("lodash-inflection"));
import { Provider, connect } from 'react-redux'
import { createLogic, createLogicMiddleware } from 'redux-logic'
import axios from 'axios'

const LOAD_USERS = 'LOAD_USERS';
const LOAD_USERS_FULFILLED = 'LOAD_USERS_FULFILLED';

function loadUsers() { return { type: LOAD_USERS }; }
function loadUsersFulfilled(users) { return { type: LOAD_USERS_FULFILLED, payload: users }; }

const initialState = {
  search_results: [],
  top_list: [],
  fetchStatus: "",
  loading: false,
  filterBy: "",
  skater: "",
}

const SEARCH_USERS = 'SEARCH_USERS';
const SEARCH_USERS_CANCEL = 'SEARCH_USERS_CANCEL';
const SEARCH_USERS_FULFILLED = 'SEARCH_USERS_FULFILLED';
const SEARCH_USERS_REJECTED = 'SEARCH_USERS_REJECTED';
const SELECT_SKATER = 'SELECT_SKATER';
const CLEAR_SEARCH = 'CLEAR_SEARCH';

function searchUsers(by) { return { type: SEARCH_USERS, by }; }
function searchUsersCancel() { return { type: SEARCH_USERS_CANCEL }; }

function selectSkater(choice) { 
  return { type: SELECT_SKATER, choice }; }

function clearSearch() { return { type: CLEAR_SEARCH }; }

function searchUsersFulfilled(users) {
  return { type: SEARCH_USERS_FULFILLED, payload: users };
}

function searchUsersRejected(err) {
  return { type: SEARCH_USERS_REJECTED, payload: err, error: true };
}

const loadUsersLogic = createLogic({
  type: LOAD_USERS,
  latest: true,
  async process({ httpClient, getState, action }, dispatch, done) {
    try {
      // the delay query param adds arbitrary delay to the response
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

/*
 * const selectSkaterLogic = createLogic({ 
  type: SELECT_SKATER, 
  process({ httpClient, getState, action}, dispatch, done) {
    dispatch(selectSkater(action.skater) );  
    done();
  }
});
*/

const usersFetchLogic = createLogic({
  type: [SEARCH_USERS],
  //debounce: 250,
  cancelType: SEARCH_USERS_CANCEL,
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
        // the delay query param adds arbitrary delay to the response
        //console.log(action.by);
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


const deps = {
  httpClient: axios
};
const arrLogic = [loadUsersLogic, usersFetchLogic];
const logicMiddleware = createLogicMiddleware(arrLogic, deps);


// reducer catches it, and then transforms?
function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS:
      return {
        ...state,
        fetchStatus: "Loading Top List... ",
        top_list: [],
        loading: true,
      };
    case LOAD_USERS_FULFILLED:
      return {
        ...state,
        top_list: action.payload,
        loading: false,
        fetchStatus: "",
      }
    case SEARCH_USERS:
      return {
        ...state,
        fetchStatus: `fetching... ${(new Date()).toLocaleString()}`,
        filterBy: action.by,
        choice: "",
        search_results: [],
        loading: true,
      };
    case SELECT_SKATER:
      return {
        ...state,
        choice: _.titleize(action.choice),
        search_results: []
      }
    case CLEAR_SEARCH:
       return {
         ...state,
         choice: null,
         search_results: [],
         loading: false,
         fetchStatus: "Type a skater"
       }
    case SEARCH_USERS_FULFILLED:
      return {
        ...state,
        search_results: action.payload,
        loading: false,
        fetchStatus: `Results from ${(new Date()).toLocaleString()}`
      };
    case SEARCH_USERS_REJECTED:
      return {
        ...state,
        loading: false,
        fetchStatus: `errored: ${action.payload}`
      };
    case SEARCH_USERS_CANCEL:
      return {
        ...state,
        loading: false,
        fetchStatus: 'user cancelled'
      };    

    case 'ERROR_GENERATED':
      return action
    default:
      return state
  }
}

const store = createStore(reducer, initialState, applyMiddleware(logicMiddleware));

function mapDispatchToProps(dispatch) {  
  return bindActionCreators({
    Search: (ev) => searchUsers(ev.target.value),
    SelectSkater: (item) => selectSkater(item),
    clearSearch,
    searchUsersCancel,
    loadUsers
  }, dispatch);
}

class TopList extends React.Component {
 
  constructor(props) {
    super(props);
  }
  
  render() {
    let home_skaters = _.filter(this.props.items, item => (item.location === "horse_team"))
    let away_skaters = _.filter(this.props.items, item => (item.location === "other_team"))
    
    let home_team = home_skaters[0] || { "team": "" }
    let away_team = away_skaters[0] || { "team": "" }
    
    let top_home = home_skaters
      .map((item,i) => <li key={i}>{_.titleize(item.name)} G: {item.goals} A: {item.assists} </li>)
      .slice(0,5);
    
    let top_away = away_skaters
      .map((item,i) => <li key={i}>{_.titleize(item.name)} G: {item.goals} A: {item.assists} </li>)
      .slice(0,5);
    
    return (
            <div>
              <p>{ home_team.team }</p>
              <ul> { top_home } </ul>
              <p>{ away_team.team }</p>
              <ul>{ top_away } </ul>
            </div>
    );
  }

}

class SearchResults extends React.Component {

  constructor(props) {
    super(props);
  }
 
  render() {
    if (_.isEmpty(this.props.filterBy)) return null;
 
    let items = this.props.items
            .filter(item => this.props.filterBy && this.props.filterBy.length > 1 &&  _.toLower(item).indexOf(_.toLower(this.props.filterBy)) >= 0 )
            .map((item, i) => <div className="row border-top-0 border-primary" key={i}><a onClick={() => { this.props.onHandleSelect(item) } } className="btn btn-default option-list-item">{_.titleize(item)}</a></div>);
   
    if (!_.isEmpty(this.props.items)) return (<div> {items} </div>);
    return null;
  }
}

// Short hand way:
//
// const List = ({ items, filterBy }) => {

//   return (
//     <ul>
//       {
//         items
//           .filter(item =>  filterBy && _.startsWith(_.lowerCase(item) , _.lowerCase(filterBy) ) )
//           .map((item, i) => <li key={i}>{item}</li>)

//       }
//     </ul>

//   )
// }


class AsyncApp extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.loadUsers();
  }

  render() {

    const { filterBy, Search, searchResults, fetchStatus, loading, topList, SelectSkater, choice, clearSearch } = this.props;


    let html = null;
    let skater_names = searchResults.map(user => ( user.name ));
    let top_list = _.sortBy(topList, user => -(user.points) );

    // TODO move this logic out of render
    let inputProps = !(choice === "") ? { value: choice } : {}
    inputProps = choice === null ? { value: "" } : inputProps
    
    html =  
      <div className="form-group col-sm-4">
        <input {...inputProps} type="text"  autoFocus="true" onChange={Search}/>
        <SearchResults items={skater_names} onHandleSelect={SelectSkater} filterBy={filterBy} />
        <TopList items={top_list} />
        <p>{fetchStatus}</p>
      </div>

      return (html)
  }
}

const ConnectedApp = connect(
  state => ({
    filterBy: state.filterBy,
    searchResults: state.search_results,
    topList: state.top_list, 
    fetchStatus: state.fetchStatus,
    loading: state.loading,
    choice: state.choice,
  }),
  mapDispatchToProps
  
)(AsyncApp);

document.addEventListener('DOMContentLoaded', () => {
  var react_div = document.createElement('div');
  react_div.className = "col-12";
  
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById("react").appendChild(react_div),
  )
})
