import React,{useState } from 'react';
import CharacterPlayer from './character-player';
import {ToggleButton, Button} from "react-bootstrap";
import Scorecard from './scorecard';
import {
  isMobile,
} from "react-device-detect";

export default function SimulationScreen (props){
  var config = props.config;
  var mode = props.mode;
  var scores = props.scores;

  var pages = config.nodes[0].page
  var id = pages[0].$.id;
  var link =  pages[0].link
  var nextPageId = link[0].$.nextPageId
  var startPage, startText

  const [pageId, setPageId] = useState(id);
  const [history, setHistory] = useState([]);
  const [action, setAction] = useState([]);
  const [showFeedback, setShowFeedback] = useState(true);
  const [showScore, setShowScore] = useState(true);
 
  var backgroundPath = config.$.flvPath.replace('video','graphic');
  
  if (mode != null) 
  {
    if (id == pageId){
      id = nextPageId //advance to the next page if we are on the start page
    }
    else{
      id = pageId; //options selected, go to the option page
    }
  }
   //Find the page with the link id
  var page = pages.filter(function(item) {
    return item.$.id === id;
  })[0]

  var onEnded = function(option){
    
    //Current video ended, go to the next page or show options
    var link =  option.link
    if (link){
    var nextPageId = link[0].$.nextPageId
    if (nextPageId){
        setPageId(nextPageId);
      }
    }
  };

  var handleBtnRestartClick = function(){
    if (history.length >0){
      setHistory([]);
      //Clear scores
      for (var k in scores) {
            delete scores[k];
        }
    }
    setPageId(pages[0].$.id);
    action[0] = null
    props.onRestart();
   };
   
   var handleBtnReplayClick = function(){
     setAction(["replay"])
   };

   var handleBtnReviewClick = function(){
    setAction(["review"])
  };

  var handleBtnScorecardClick = function(){
    setAction(["scorecard"])
  };

  var onScoreUpdate = function(score,status){
    props.onScoreUpdate(score,status);
  };

  //Rendering...
  var buttonLayout = "horizontal-buttons";
  if (isMobile){
    buttonLayout = "vertical-buttons";
  }

  if (page.$.type === "startPage"){
    return buildStartPage(page);
  }
  else if (page.$.type === "character" || page.$.type == null){
    return buildCharacterPage(page)
  }
  else if (page.$.type === "scoreCard"){
    if (action[0] === "review"){
      var page = history[history.length - 1]
      return buildReviewPage(page)
    }
    else{
      action[0] = props.mode;
      return buildScorecardPage(page)
    }
  }
  else if (page.$.type === "endPage"){
    if (action[0] === "review"){
      var page = history[history.length - 1]
      return buildReviewPage(page)
    }
    else{
      action[0] = props.mode;
      return buildEndPage(page)
    }
  }

  function buildCharacterPage(page){
    var buttons = ""
    if (mode == "coach"){
      buttons = (
        <div className={buttonLayout}>
            <div className="space-button">
              {<Button variant="primary" className="btn-simulation" onClick={handleBtnRestartClick}>重新開始</Button>}
            </div>
            <div className="space-button">
              {<Button variant="primary" className="btn-simulation" onClick={handleBtnReplayClick} >再講一次</Button>}
            </div>
            <div className="space-button">
              <ToggleButton type="checkbox" className="btn-simulation" variant="secondary" checked={showFeedback} value="1" onChange={(e) => setShowFeedback(e.currentTarget.checked)}>
                教練回饋
              </ToggleButton>
            </div>
            <div className="space-button">
            <ToggleButton type="checkbox" className="btn-simulation" variant="secondary" checked={showScore} value="1" onChange={(e) => setShowScore(e.currentTarget.checked)}>
              技巧得分
            </ToggleButton>
            </div>
          </div>)
    }
    else{
      buttons = (<div className={buttonLayout}>
            <div className="space-button">
              {<Button variant="primary" className="btn-simulation" onClick={handleBtnRestartClick}>重新開始</Button>}
            </div>
            <div className="space-button">
              {<Button variant="primary" className="btn-simulation" onClick={handleBtnReplayClick} >再講一次</Button>}
            </div>
          </div>)
    }
   
    return (
      <div className="vertical-flex">
        <CharacterPlayer mode={mode} action={action} config={config} page={page} playing={props.playing} onEnded={onEnded} history={history} scores={scores} showFeedback={showFeedback} showScore={showScore}/>
        {buttons}
     </div>
    )
  }

  
  function buildReviewPage(page){
   
    return (
      <div className="relative" style={{width:`100%` , height:`100%`}}>
        <CharacterPlayer mode={mode} action={action} config={config} page={page} playing={props.playing} onEnded={onEnded} history={history} scores={scores} showFeedback={showFeedback} showScore={showScore}/>
          <div className={buttonLayout}>
            <div className="space-button">
              {<Button variant="primary" className="btn-simulation" onClick={handleBtnRestartClick}>重新開始</Button>}
            </div>
            <div className="space-button">
              {<Button variant="primary" className="btn-simulation" onClick={handleBtnScorecardClick}>成績</Button>}
            </div>
            <div className="space-button">
              <ToggleButton type="checkbox" className="btn-simulation" variant="secondary" checked={showFeedback} value="1" onChange={(e) => setShowFeedback(e.currentTarget.checked)}>
                教練回饋
              </ToggleButton>
            </div>
            <div className="space-button">
            <ToggleButton type="checkbox" className="btn-simulation" variant="secondary" checked={showScore} value="1" onChange={(e) => setShowScore(e.currentTarget.checked)}>
              技巧得分
            </ToggleButton>
            </div>
          </div>
     </div>
    )
  }
  function buildStartPage(page){
    if (page.text){
      startPage = page.text[0]
      startText = { __html: startPage };
    }
    return (
      <div className="relative" style={{width:`100%` , height:`100%`}}>
        <img className="absolute-lt" src={page.$.background} width="100%"/>
        <div className="page-startend"><div dangerouslySetInnerHTML={startText}/></div>
      </div>  
    );
  };

  function buildEndPage(page){
    return (
      <div className="relative" style={{width:`100%` , height:`100%`}}>
      <div className="relative" style={{width:`100%` , height:`100%`}}>
        <img className="absolute-lt" src={page.$.background} width="100%"/>
        <div className="page-startend"><div>{page.text[0]}</div></div>
      </div>
      <div className={buttonLayout}>
        <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={handleBtnRestartClick}>重新開始</Button></div>
        <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={handleBtnReviewClick} >教練回饋</Button></div>
      </div>
      </div>
    );
  };

  function buildScorecardPage(page){
    var pass = false;
    if (config.copyright && config.copyright.$.scorm === true){
      if (config.copyright.passingScore[0]){
        
      }
    }
    return (
      <div className="relative" style={{width:`100%` , height:`100%`}}>
          <div className="relative" style={{width:`100%` , height:`100%`}}>
            <img className="absolute-lt" src={backgroundPath + page.$.background} width="100%" height="100%"/>
            <div className="absolute-scroll">
              <div className="scorecard">
                <div className="wrapper">{page.text[0]}</div>
                <Scorecard config={config} mode={mode} scores={scores} type={"category"} onScoreUpdate={onScoreUpdate}/></div>
            </div>
          </div>
          <div className={buttonLayout}>
            <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={handleBtnRestartClick}>重新開始</Button></div>
            <div className="space-button"><Button variant="primary" className="btn-simulation" onClick={handleBtnReviewClick}>教練回饋</Button></div>
          </div>
    </div>
    );
  };

}
