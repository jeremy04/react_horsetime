// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import _ from 'lodash'
import { Provider, connect } from 'react-redux'

// when user starts typing, call this function
function myFilter(by) {  
  return { type: 'SET_FILTER', by };
}

const initialState = {  
  filterBy: ""
}

// reducer catches it, and then transforms?
function reducer(state = initialState, action) {  
  switch (action.type) {
    case 'SET_FILTER':
      
      return Object.assign({}, state, {
        filterBy: action.by
      })
    default:
      return state
  }
}

const store = createStore(reducer);  

const mapStateToProps = (state) => {
  return {
    filterBy: state.filterBy
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (ev) => dispatch(myFilter(ev.target.value))
  }
}


class List extends React.Component {
 
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.filterBy);

    let items = this.props.items
            .filter(item =>  this.props.filterBy && this.props.filterBy.length > 1 &&  _.lowerCase(item).indexOf(_.lowerCase(this.props.filterBy)) >= 0 )
            .map((item, i) => <li key={i}>{item}</li>)

    if (_.isEmpty(this.props.filterBy)) {
      return null;
    }
    else if(!_.isEmpty(items))
    {
      return(<ul> { items } </ul>)
    }
    else {
      return(<p>No items found</p>)
    }
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

class FilterList extends React.Component {  
  render() {
    
    const hockeyPlayers = ['Sidney Crosby', 'Evgeni Malkin', 'Phil Kessel', 'Kris Letang'];
    const { filterBy, updateFilter } = this.props;

    // simple input box and our List component
    return (
      <div>
        <input type="text" onChange={updateFilter}/>
        <List items={hockeyPlayers} filterBy={filterBy} />
      </div>
    )
  }
}

FilterList = connect(mapStateToProps, mapDispatchToProps)(FilterList);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={store}>
      <FilterList />
    </Provider>,
    document.body.appendChild(document.createElement('div')),
  )
})
