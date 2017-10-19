// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, bindActionCreators } from 'redux'
import _ from 'lodash'
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
  filterBy: ""
}

const SEARCH_USERS = 'SEARCH_USERS';
const SEARCH_USERS_CANCEL = 'SEARCH_USERS_CANCEL';
const SEARCH_USERS_FULFILLED = 'SEARCH_USERS_FULFILLED';
const SEARCH_USERS_REJECTED = 'SEARCH_USERS_REJECTED';

function searchUsers(by) { return { type: SEARCH_USERS, by }; }
function searchUsersCancel() { return { type: SEARCH_USERS_CANCEL }; }

function searchUsersFulfilled(users) {
  return { type: SEARCH_USERS_FULFILLED, payload: users };
}

function searchUsersRejected(err) {
  return { type: SEARCH_USERS_REJECTED, payload: err, error: true };
}

const loadUsersLogic = createLogic({
  type: LOAD_USERS,
  latest: true,
  async process({ httpClient }, dispatch, done) {
    try {
      // the delay query param adds arbitrary delay to the response
      const users =
        await httpClient.get('https://reqres.in/api/users')
          .then(resp => resp.data.data);
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
  debounce: 500,
  cancelType: SEARCH_USERS_CANCEL,
  latest: true, // take latest only
  
  validate({ getState, action }, allow, reject) {
    if (action.by) {
      allow(action);
    } else { // empty request, silently reject
      console.log("Empty request for action");
      reject();
    }
  },
  async process({ httpClient, getState, action }, dispatch, done) {
      try {
        // the delay query param adds arbitrary delay to the response
        console.log(action.by);

        const users =
          await httpClient.get('https://reqres.in/api/users')
            .then(resp => resp.data.data);
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
        search_results: [],
        loading: true,
      };
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
    searchUsersCancel,
    loadUsers
  }, dispatch);
}

class TopList extends React.Component {
 
  constructor(props) {
    super(props);
  }
  
  render() {
    let items = this.props.items.map((item,i) => <li key={i}>{item}</li>);
    return (<ul> { items } </ul>);
  }
 
}

class SearchResults extends React.Component {

  constructor(props) {
    super(props);
  }

  renderNotFound() {
    return (
      <p> No Items Found </p>
    )
  }

  render() {
    if (_.isEmpty(this.props.filterBy)) return null;
 
    let items = this.props.items
            .filter(item => this.props.filterBy && this.props.filterBy.length > 1 &&  _.toLower(item).indexOf(_.toLower(this.props.filterBy)) >= 0 )
            .map((item, i) => <li key={i}>{item}</li>);
    
    if (!_.isEmpty(items)) return (<ul> { items } </ul>);
    return this.renderNotFound();
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

    const { filterBy, Search, searchResults, fetchStatus, loading, topList } = this.props;

    let html = null;
    let first_names = searchResults.map(user => ( user.first_name ));
    let top_list_first_names = _.sortBy(topList.map(user => ( user.first_name )));

    html =  
      <div>
        <input autoFocus="true" onChange={Search}/>
        <SearchResults items={first_names} filterBy={filterBy} />
        <TopList items={top_list_first_names} />
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
    loading: state.loading
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
