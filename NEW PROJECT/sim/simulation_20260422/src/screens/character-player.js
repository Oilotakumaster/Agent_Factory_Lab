import React,{useState, useRef} from 'react';
import VideoPlayer from './video-player';
import DialogPlayer from './dialog-player';
import DialogLine from './dialog-line'; 

import {
  isMobile
} from "react-device-detect";

export default function CharacterPlayer (props){
  
  var page = props.page;
  var config = props.config;
  var history = props.history;
  var scores = props.scores;
  var playing = props.playing;
  var backgroundPath = config.$.flvPath.replace('video','graphic');
  const parentRef = useRef(null);

  var mediaUrl, idleUrl, graphicUrl
  if (page.$.mediaType === "video" && !isMobile){
    mediaUrl = config.$.flvPath + page.$.videoSource;
    idleUrl = config.$.flvPath + page.$.idleMediaSource;
  }
  else{
    if (page.$.mediaType === "graphic"){
      var audioPath = config.$.flvPath.replace('graphic','audio');
      mediaUrl = audioPath + page.$.audioSource;
      graphicUrl = config.$.flvPath + page.$.graphicSource
      idleUrl = config.$.flvPath + page.$.idleMediaSource;
    }
    else{
      //Video mode on mobile, revert to graphic
      audioPath = config.$.flvPath.replace('video','audio');
      mediaUrl = mediaUrl = audioPath + page.$.videoSource.replace('f4v','mp3');
    }
  }

  const [showOptions, setShowOptions] = useState(false);
  const [lastHeight, setLastHeight] = useState([]);
  var fillPage = "50%";
  if (config.$.dialogStart){
    fillPage = ((1-config.$.dialogStart) * 100).toString() + "%"
  }
  var idle = [showOptions]; //use array so that it can be updated in video player

  //Component reload when showOptions is set to false, but this is an intermediate state where options are hidden, but new dialog not loaded yet, 
  //so last item in history is still option, keep idle as true, until the timer fires onEnded to load new dialog
  if (history && history.length > 1 && !history[history.length-1].options && history[history.length-2].$.id === page.$.id){ //options can't have options
    idle[0] = true;
  }

  if (props.action[0] === "replay"){
    idle[0] = false;
  }

  var onEnded = function(){
      if (page.options && page.options.length > 0){
        //if (showOptions == false){
          //randomize page.options
          var randomOptions = randomize(page.options[0].link);
          page.options[0].link = randomOptions;
          setShowOptions(true);
       // }
      }
      else{
        props.onEnded(page);
      }
  }

  function randomize(optionIds){
    
    if (optionIds.length > 1){
      return optionIds.sort(() => Math.random() - 0.5)
    }
    else{
      return optionIds
    }
  }

  function onOptionSelected(option, lastItemHeight){
    //add the selected option to history so that it will be added to the dialog
    history.push(option);
   
    var dialogStart = 0.5
    if (config.$.dialogStart){
      dialogStart = parseFloat(config.$.dialogStart)
    }
    
    if (props.mode === "coach" && (props.showScore || props.showFeedback)){
      if (props.showScore && props.showFeedback){
        lastItemHeight = lastItemHeight + 63
      }
      else{
        lastItemHeight = lastItemHeight + 50
      }
    }
    else{
      lastItemHeight = lastItemHeight + 7
    }
    lastHeight[0] = parentRef.current.clientHeight*dialogStart + lastItemHeight;

    //Save scores
    option.scores[0].score.forEach(o => {
      if (scores[o.$.objective] !== undefined){
        scores[o.$.objective].score += parseInt(o._);
        scores[o.$.objective].total += 5;
      }
      else{
        var score = {};
        score.score = parseInt(o._);
        score.total = 5;
        scores[o.$.objective] = score;
      }
    });

    setShowOptions(false);

    //wait for a second before notifying parent to load next dialog
    var waitTime = 2000;
    if (props.mode === "coach" && (props.showScore || props.showFeedback)){
      waitTime = 5000;
    }
    setTimeout(function () {
      if (parentRef.current){
        lastHeight[0] = parentRef.current.clientHeight * dialogStart;
      }
      props.onEnded(option)
    }, waitTime);
  }

  if (page.$.type === "character"){
    if (page.$.mediaType === "graphic" || isMobile){
      return buildCharacterGraphicPage(page)
    }
    else{
      return buildCharacterVideoPage(page)
   }
  }
  else{
    props.onEnded(page)
  }

  function buildCharacterVideoPage(page){
 /*style={{width:`${config.$.characterWidth}`, height:`${config.$.characterHeight}`, left:`${config.$.characterX}`, top:`${config.$.characterY}`}}*/
    return (
      <div>
        <div class="relative" ref={parentRef}>
          <img class="relative" src={backgroundPath + page.$.background} width="100%" height="100%"/>
          <VideoPlayer
                          config={config}
                          mediaUrl={mediaUrl} 
                          idleUrl={idleUrl}
                          playing={playing}
                          idle={idle}
                          mode={props.mode}
                          action={props.action}
                          onEnded={onEnded}
                        />
          <DialogLine config={config} history={history} page={page}  action={props.action} mode={props.mode} showOptions={showOptions} lastHeight={lastHeight[0]} fillPage={fillPage}
           onOptionSelected={onOptionSelected} backgroundPath={backgroundPath} showFeedback={props.showFeedback} showScore={props.showScore}/>
        </div> 
    </div>  
    );
  }

  function buildCharacterGraphicPage(page){

    return (
      <div>
        <div class="relative" ref={parentRef}>
          <img class="relative" src={backgroundPath + page.$.background} width="100%" height="100%"/>
          <DialogPlayer
                          config={config}
                          mediaUrl={mediaUrl}
                          graphicUrl={graphicUrl} 
                          idleUrl={idleUrl}
                          playing={playing}
                          idle={idle}
                          mode={props.mode}
                          action={props.action}
                          onEnded={onEnded}/>
          <DialogLine config={config} history={history} page={page} action={props.action} mode={props.mode} showOptions={showOptions} lastHeight={lastHeight[0]} fillPage={fillPage}
          onOptionSelected={onOptionSelected} backgroundPath={backgroundPath} showFeedback={props.showFeedback} showScore={props.showScore}/>
        </div>
    </div>  
    );
  }
  
}
