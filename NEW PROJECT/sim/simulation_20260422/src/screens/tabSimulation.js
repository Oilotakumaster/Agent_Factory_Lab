import React, {useState, useEffect} from 'react';
import SimulationScreen from './simulation-screen';
import {Button} from "react-bootstrap";
import { isMobile } from 'react-device-detect';
import { insertLog } from './courseService';

class TabSimulation extends React.Component{
  constructor(props) {
    super(props);
    this.state = { mode: null};

    this.onRestart = function(){
      this.setState({mode:null});
    }.bind(this);

    this.onScoreUpdate = function(score,status){
      this.props.onScoreUpdate(score,status);
    }.bind(this);

    this.handleBtnCoachClick = function(){
      this.setState({mode:"coach"});
      insertLog(this.props.config)
    }.bind(this);
    
    this.handleBtnTestClick = function(){
      this.setState({mode:"test"});
      insertLog(this.props.config)
    }.bind(this);
    
  }

  render(){

  var buttonStyle="horizontal-buttons";
  if (isMobile){
    buttonStyle = "float-h-buttons "
  }
  var buttons = ""
  if (this.state.mode == null){//initial screen, mode not selected yet, add buttons, otherwise hide buttons
    if (this.props.config.$.mode != null && this.props.config.$.mode == "test"){
      buttons = (<div className={buttonStyle}>
        <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={this.handleBtnTestClick} >測驗(計分)</Button></div>
        </div>)
    }
    else if (this.props.config.$.mode != null && this.props.config.$.mode == "coach")
   {
    buttons = (<div className={buttonStyle}>
      <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={this.handleBtnCoachClick}>練習(不計分)</Button></div>
      </div>)
   }
   else{
    buttons = (<div className={buttonStyle}>
      <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={this.handleBtnCoachClick}>練習(不計分)</Button></div>
      <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={this.handleBtnTestClick} >測驗(計分)</Button></div>
      </div>)
   }
  }
 
  return (
    <div class="relative" style={{width:`100%` , height:`100%`}}>
         <SimulationScreen mode={this.state.mode} config={this.props.config} scores={this.props.scores} playing={this.props.playing}
          onRestart={this.onRestart} onScoreUpdate={this.onScoreUpdate}/>
         {buttons}
    </div>
  );
  }
}
export default TabSimulation;

 
