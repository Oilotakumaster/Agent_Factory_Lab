import React,{useState} from 'react';
import {Container, Table, Row, Col} from "react-bootstrap";

export default function Scorecard(props){
  let config = props.config;
  let mode = props.mode;
  let scores = props.scores;
  let type = props.type;
  var status = "browsed"; //"passed", "completed", "failed", "incomplete", "browsed", "not attempted"
  var isCompleted = false;
  let passingScore = props.config.copyright.passingScore[0];
  var subObjectiveScores = [];
  var currentScore = {};

  //first map scores into objectives
  var objectives = config.objectives[0].category;
  var totalScore = {};
  totalScore.score = 0;
  totalScore.total = 0;
  totalScore.percentage = "0%";
  totalScore.objective = "總積分:"
  subObjectiveScores.push(totalScore);
  objectives.forEach(function(o,i) {
   
    var objectiveScore = {};
    objectiveScore.objective = o.$.id + ' ' + o.$.name;
    objectiveScore.score = 0;
    objectiveScore.total = 0;
    objectiveScore.percentage = "0%";
    subObjectiveScores.push(objectiveScore);
    //var objectiveIndex = subObjectiveScore.length - 1
    if (o.objective){
      o.objective.forEach(so =>{
        var subObjectiveScore = {};
        //subObjectiveScore.objective = o.$.id + ' ' + o.$.name;
        subObjectiveScore.subObjective = so.$.id + ' ' + so.$.name;
        if (scores[so.$.id] != null){
          subObjectiveScore.score = scores[so.$.id].score;
          subObjectiveScore.total = scores[so.$.id].total;
          if (subObjectiveScore.total > 0){
            subObjectiveScore.percentage = Math.round(subObjectiveScore.score /subObjectiveScore.total * 100).toString() + "%";
          }
        }
        else{
          subObjectiveScore.score = 0;
          subObjectiveScore.total = 0;
          subObjectiveScore.percentage = "0%";
        }
        objectiveScore.score += subObjectiveScore.score;
        objectiveScore.total += subObjectiveScore.total 
        if (objectiveScore.total >0){
          objectiveScore.percentage = Math.round(objectiveScore.score /objectiveScore.total * 100).toString() + "%";
        }
        
        subObjectiveScores.push(subObjectiveScore);
      });
    }
    
    totalScore.score += objectiveScore.score;
    totalScore.total += objectiveScore.total
  });

  if (totalScore.total > 0){
    var totalPercentage = Math.round(totalScore.score /totalScore.total * 100);
    totalScore.percentage = totalPercentage.toString() + "%";
   
    isCompleted = (totalPercentage >= parseInt(passingScore));
    //"passed", "completed", "failed", "incomplete", "browsed", "not attempted";
    if (isCompleted)
      {
        status = "passed";
      }
      else{
        status = "failed";
      }
    currentScore.percentage = totalPercentage;
    currentScore.status = status;
   
    if (props.onScoreUpdate && mode === "test"){
      props.onScoreUpdate(currentScore.percentage,currentScore.status);
    }
  }

  function buildScoresTable(subObjectiveScores){

    return ( subObjectiveScores.map(function (k, index) { 
      if (k.objective === "總積分:"){
        if (type === "category"){
          return (<tr key={index} className="scoreTotal"><td>{k.objective}</td><td>{k.score}</td><td>{k.total}</td><td>{k.percentage}</td></tr>)
        }
        else{
          return (<tr key={index} className="scoreTotal"><td>{k.objective}</td><td>{k.subObjective}</td><td>{k.score}</td><td>{k.total}</td><td>{k.percentage}</td></tr>)
        }
      }
      else if (!k.subObjective){
        if (type === "category"){
          return (<tr key={index} className="scoreHeader"><td>{k.objective}</td><td>{k.score}</td><td>{k.total}</td><td>{k.percentage}</td></tr>)
        }
        else{
          return (<tr key={index} className="scoreHeader"><td>{k.objective}</td><td>{k.subObjective}</td><td>{k.score}</td><td>{k.total}</td><td>{k.percentage}</td></tr>)
        }
        
      }
      else{
        if (type !== "category"){
            return (<tr key={index} ><td>{k.objective}</td><td>{k.subObjective}</td><td>{k.score}</td><td>{k.total}</td><td>{k.percentage}</td></tr>)
        }
        else{
          return ("")
        }
      } 
    }
    )
    )
  }

  function buildScoresHeader(){
    if (type === "category"){
      return (<thead className="scoreHeader">
        <tr>
            <th>技巧類別</th>
            <th>實得分</th>
            <th>應得分</th>
            <th>得分率</th>
        </tr>
        </thead>)
    }
    else{
      return (<thead>
        <tr>
            <th>技巧類別</th>
            <th>技巧明細</th>
            <th>實得分</th>
            <th>應得分</th>
            <th>得分率</th>
        </tr>
        </thead>)
    }
  }
  
  var header = buildScoresHeader();
  var table = buildScoresTable(subObjectiveScores);
  var status;
  if (mode == "test"){
    if (isCompleted){
      status = (<div class="pass-status">通過</div>)
    }
    else{
      status = (<div class="fail-status">不通過</div>)
    }
  }
  else{
    status = (<div></div>)
  }

  return (<Container>
    <Row><Col>{status}</Col></Row>
    <Row><Col><Table bordered hover size="sm" className="scoreTable">
        {header}
        <tbody>
          {table}
        </tbody>
  </Table></Col></Row>
 
  </Container>)
}
