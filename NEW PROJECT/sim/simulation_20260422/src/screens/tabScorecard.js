import React from 'react';
import Scorecard from './scorecard';

export default function Tab4(props){
  let config = props.config;
  let scores = props.scores;

  return (
      <Scorecard config={config} scores={scores} mode={"objective"}/>
    )
}
