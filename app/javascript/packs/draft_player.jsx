import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, bindActionCreators } from 'redux'
import _ from 'lodash'
_.mixin(require("lodash-inflection"));
import { Provider, connect } from 'react-redux'
import { createLogic, createLogicMiddleware } from 'redux-logic'
import axios from 'axios'

import * as types from './constants/action_types'
import * as actions from './actions/index' 
import TopList from './components/top_list'
import SearchResults from './components/search_results'

const initialState = {
  search_results: [],
  top_list: [],
  fetchStatus: "",
  loading: true,
  filterBy: "",
  choice: "",
}

function searchUsers(by) { return { type: types.SEARCH_USERS, by }; }
function selectSkater(choice) { return { type: types.SELECT_SKATER, choice }; }
function clearSearch() { return { type: types.CLEAR_SEARCH }; }
function loadUsers() { return { type: types.LOAD_USERS }; }

const deps = {
  httpClient: axios
};
const arrLogic = [actions.loadUsersLogic, actions.usersFetchLogic];
const logicMiddleware = createLogicMiddleware(arrLogic, deps);

// reducer catches it, and then transforms?
function reducer(state = initialState, action) {
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
        search_results: [],
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

const store = createStore(reducer, initialState, applyMiddleware(logicMiddleware));

function mapDispatchToProps(dispatch) {  
  return bindActionCreators({
    Search: (ev) => searchUsers(ev.target.value),
    SelectSkater: (skater) => selectSkater(skater),
    clearSearch,
    loadUsers
  }, dispatch);
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
    let top_html = <div className="col-sm-9" style={{ height: 500 + 'px' }}>
                  </div>;

    let skater_names = searchResults.map(user => ( user.name ));
    let top_list = _.sortBy(topList, user => -(user.points) );
    
    if (!this.props.loading) {
      top_html =
            <div className="col-sm-9">
              <TopList items={top_list} />
              <p>{fetchStatus}</p>
            </div>
    }
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
            {top_html} 
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

  if (!_.isEmpty(location.hash.slice(1))) {
    var react_div = document.createElement('div');
    react_div.className = "col-12";

    ReactDOM.render(
      <Provider store={store}>
      <ConnectedApp />
      </Provider>,
      document.getElementById("react").appendChild(react_div),
    )
  }
})
