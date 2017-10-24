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
  choice: "",
}

const SEARCH_USERS = 'SEARCH_USERS';
const SEARCH_USERS_FULFILLED = 'SEARCH_USERS_FULFILLED';
const SEARCH_USERS_REJECTED = 'SEARCH_USERS_REJECTED';
const SELECT_SKATER = 'SELECT_SKATER';
const CLEAR_SEARCH = 'CLEAR_SEARCH';

function searchUsers(by) { return { type: SEARCH_USERS, by }; }

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

const usersFetchLogic = createLogic({
  type: [SEARCH_USERS],
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
        choice: action.by,
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
         choice: "",
         search_results: [],
         loading: false,
         fetchStatus: "",
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
    SelectSkater: (skater) => selectSkater(skater),
    clearSearch,
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
    this.setWrapperRef = this.setWrapperRef.bind(this);           
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Clear search if clicked on outside of element
   */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.clearSearch()
    }
  }

  render() {
 
   const { filterBy, items, onHandleSelect } = this.props;

   if (_.isEmpty(filterBy)) return null;
 
    let filtered_items = 
      items.filter(item => 
              filterBy && 
              filterBy.length > 2 &&  
               _.toLower(item).indexOf(_.toLower(filterBy)) >= 0 
            )
            .map((item, i) => 
              <div className="dropdown-item" key={i} onClick={() => { onHandleSelect(item) } }>
                  {_.titleize(item)}
              </div>
            );

    if (!_.isEmpty(filtered_items)) return (<div ref={this.setWrapperRef} className="dropdown-menu show"> {filtered_items} </div>);
    return null;
  }
}

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

    html =
      <div className="container">
        <div className="row">
          
          <div className="col-sm-3">
            <div className="input-group">
              
              <div className="input-group-btn">
                <SearchResults items={skater_names} 
                                onHandleSelect={SelectSkater} 
                                clearSearch={clearSearch} 
                                filterBy={filterBy} />
              </div> 
                <input className="form-control" value={choice} type="text"  autoFocus="true" onChange={Search}/>
                 <button type="button" className="btn btn-primary btn-sm">
                  Draft
                </button>
          </div>
            
          </div>
          
          <div className="col-sm-9">
            <TopList items={top_list} />
            <p>{fetchStatus}</p>
          </div>
        
        </div>
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
