import React from 'react';
import ReactDOM from 'react-dom'
import _ from 'lodash'
_.mixin(require("lodash-inflection"));

const TopList = ({ items }) => { 

    let home_skaters = _.filter(items, item => (item.location === "horse_team"))
    let away_skaters = _.filter(items, item => (item.location === "other_team"))

    let home_team = home_skaters[0]
    let away_team = away_skaters[0]

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

/*
document.addEventListener('DOMContentLoaded', () => {
    let top_list = [ { "team": "Flyers", "location": "horse_team", "goals": 0, "assists": 0, "name": "HeyNah" },
                     { "team": "Flyers", "location": "other_team", "goals": 0, "assists": 0, "name": "GreenSky" }]
    var react_div = document.createElement('div');
    react_div.className = "col-12";

   ReactDOM.render(
      <TopList items={top_list} />,
      document.getElementById("react").appendChild(react_div),
    )
})

*/

export default TopList;
