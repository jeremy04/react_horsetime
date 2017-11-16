import React from 'react';
import ReactDOM from 'react-dom'
import _ from 'lodash'
_.mixin(require("lodash-inflection"));

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

/*
document.addEventListener('DOMContentLoaded', () => {
    let names = [ "Joe", "Frank" ] 
    
    var react_div = document.createElement('div');
    react_div.className = "col-12";

   ReactDOM.render(
      <SearchResults items={names} />,
      document.getElementById("react").appendChild(react_div),
    )
})
*/

export default SearchResults;
