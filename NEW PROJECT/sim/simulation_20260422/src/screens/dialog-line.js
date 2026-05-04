import React,{useState, useEffect, useRef} from 'react';
import '../chat-bubble.css';
import {Button, Container, OverlayTrigger, Popover, Overlay, ProgressBar, Row, Col} from "react-bootstrap";
import {
  useSpring,
  useSprings,
  useChain,
  animated,
  useTransition,
  condition,
  config 
} from "react-spring";
import {
  isMobileOnly,
  isIOS,
  isMobile,
  isIE,
  isEdge
} from "react-device-detect";
import ReactAudioPlayer from 'react-audio-player';

export default function DialogLine (props){
  const audioRef = useRef(null);
  var lines = props.history;
  var page = props.page;

  var delay = 500;
  if (page.$.mediaType == "graphic"){
    delay = 0;
  }
  const [loadMore, setLoadMore] = useState([false]);
  
  const RollIn = ({ children }) => {
    const props = useSpring({
      from: {transform: 'translate3d(-10%,0,0)', opacity:0},
      to: {transform: 'translate3d(0,0,0)', opacity:1},
      delay:delay,
      config: {duration:500}
    });
    return <animated.div style={props}>{children}</animated.div>;
  };

  const MoveUp = ({ children }) => {
    const props = useSpring({
    // from: {transform: (isIE||isEdge)?'translateY(0)':'translateY(30%)'},
    from: {transform: (isIE||isEdge)?'translateY(0)':'translateY(6%)'},
     //from: {transform: 'translateY(30%)'},
      to: {transform: 'translateY(0)'},
      config: {duration:500}
    });
    return <animated.div style={props}>{children}</animated.div>;
  };

  const SpringIn = ({ children }) => {
    const transitions = useTransition(["",children], null, {
        trail: 800,
        from: {opacity:0},
        enter: {opacity:1},
        config: {duration:500}
    });
    return transitions.map(({ item, key, props }) =>
      item && <animated.div style={props}>{item}</animated.div>)
  };

  /*
  const SpringIn = ({ children }) => {
    const props = useSpring({
        from: {opacity: 0},
        to: {opacity: 1},
        config: {duration:500, delay:500}
    });
    return <animated.div style={props}>{children}</animated.div>;
  };
*/
  const [hide, setHide] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [sourceUrl, setSourceUrl] = useState(null);

  //Reset options hide when another dialogue continue, or during replay
  if ((!props.showOptions || props.action[0]=="replay") && hide != false){
    setHide(false)
  }

const FadeOut = ({ children }) => {
  var duration = 500
  if (hide == false && selectedOptionId != ""){
    duration = 0; //don't show animation when toggling coach feedback, show/hide of coach feedback will reload page and trigger animation
  }
  const props = useSpring({
     from: {opacity: hide == false?0:1},
     to: {opacity: hide == false || hide==children.key ?1:0},
      config: {duration:duration}
  });
  return <animated.div style={props}>{children}</animated.div>;
};

  const optionsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    if (loadMore[0]==false && props.action[0] != "review"){
      messagesEndRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'end' });//
    }
  };
  useEffect(scrollToBottom)

  if (props.showOptions == false && hide == false && page != lines[lines.length-2]){ //only add to array if it is not triggered by option hide
    pushToArray(lines,page);
  }
  
  function pushToArray(arr, obj) {
    var index = -1;
    for (var i = 0; i < arr.length; ++i) {
      var e = arr[i];
        if (e.$.id === obj.$.id) {
            index = i;
            break;
        }
    }
    
    if (index === -1 || index < arr.length - 2) {
        arr.push(obj);
    }
  }

  if(lines.length == 0){
    return <div></div>;
  }
  else{
    
    return getDialog(lines);
  }
  
  function onOptionSelected(option){
    loadMore[0]=false

    if ( props.config.$.mode == "coach" && option.$.source && !(option.$.id.indexOf('A')>0)){
      if (props.page.$.mediaType === "graphic"){
        var audioPath = props.config.$.flvPath.replace('graphic','audio');
      }
      else{
        //Video mode on mobile, revert to graphic
        audioPath = props.config.$.flvPath.replace('video','audio');
      }
      var mediaUrl = audioPath + option.$.source;
      if (audioRef.current && audioRef.current.props.src == mediaUrl){
        setTimeout(function(){
          audioRef.current.audioEl.current.play();
        },500)
      }
      else{
        setSourceUrl(mediaUrl)
      }
      //cache option for onOptionAudioEnded
      props.page.selectedOption = option
    }

    if (props.config.$.mode && props.config.$.mode == "coach"){

      if (!(option.$.id.indexOf('A')>0)){
        setSelectedOptionId(option.$.id) //toggle coach feeback button open
      }
      else{
        setSelectedOptionId("")
        
        continueDialogOption(option);
        
      }
    }
    else{
     
        continueDialogOption(option)
      
    }
  }

  function continueDialogOption(option){
    //If coach mode, check answer
    if (props.mode == "test"||!props.config.$.mode || props.config.$.mode == "coach" && option.$.id.indexOf('A')>0){
      //Animate option hide...
      setHide(option.$.id)
      setSourceUrl(null)

      setTimeout(function(){
        //Find selected html element
        var itemHeight = 50
        if (optionsRef.current){
          var htmlElements = optionsRef.current.children
          var selected = null
          for(var i=0; i<htmlElements.length; i++){
            if (htmlElements[i].firstChild.id == option.$.id){
              selected = htmlElements[i];
              break;
            }
          }
          var itemHeight = selected.clientHeight;//scrollHeight;
        }
      
        props.onOptionSelected(option, itemHeight);
      },1000);
    }
  }

  function onOptionAudioEnded(){
    continueDialogOption(props.page.selectedOption)
  }

  function onLoadMore(){
    setLoadMore([true]);
  }

  function getDialog(lines){

    var listItems = lines.map((l, index) => {
      if (lines.length <= 8 || (lines.length > 8 && index > lines.length - 8) || loadMore[0] == true ||props.action[0] == "review"){

        let bubbleClass = 'me';
        let bubbleDirection = '';
        var bubbleContainer = 'bubble-container';
        var minHeight = {};
        if (index == lines.length - 1){
          bubbleClass = 'me-new';
          minHeight = ({'min-height':`${props.lastHeight}px`})
        }

        if(l.$.type === "character"){
        
          if (!l.dialogue){
            return (<div key="error">
              <div>{"找不到dialogue:" + l.$.id}</div>
            </div>);
          }
          else{
            var icon = props.backgroundPath + l.$.background.replace(".jpg", "_icon.jpg")
            var iconTag = ""
            if (isMobile){
              iconTag = (<img className={`img-circle`} src={icon} />)
            }
            if (!props.showOptions && index == lines.length - 1){

              return (
                <RollIn key={l.$.id+index.toString()}><div style={minHeight}><div className={`${bubbleContainer} ${bubbleDirection}`}>
                    {iconTag}
                    <div className={`bubble ${bubbleClass}`}>{l.dialogue[0]}</div>
                  </div>
                  </div>
                </RollIn>
              );
            }
            else if (props.showOptions && index == lines.length - 1){
              const optionItems = makeOptions(props.showOptions, page.options);
              return (<div key={l.$.id+index.toString()} style={minHeight}>
                <div className={`${bubbleContainer} ${bubbleDirection}`}>
                  {iconTag}
                  <div className={`bubble ${bubbleClass}`}>{l.dialogue[0]}</div>
                </div>
                {optionItems}
              </div>);
            }
            else{
              return (
                <div key={l.$.id+index.toString()} className={`${bubbleContainer} ${bubbleDirection}`} style={minHeight}>
                  {iconTag}
                  <div className={`bubble ${bubbleClass}`}>{l.dialogue[0]}</div>
                </div>
              );
            }
          } 
        }
        else{
          bubbleClass = 'you';
          bubbleDirection = "bubble-direction-reverse";
          
          var vwrapper = "bubble-vwrapper";
          minHeight = {}
          if (props.mode == "coach" || props.action[0] == "review"){
            bubbleContainer = 'bubble-container-coach';
            if (index == lines.length - 1){
              minHeight = ({'min-height':`${props.lastHeight}px`})
            }
            
            var scores = "";
            if (props.showScore){
              scores = (<div>{makeScores(l.scores)}</div>);
            }

            var feedback = "";
            if (props.showFeedback){
              feedback = (<div>教練回饋:&nbsp;{l.feedback[0]}</div>);
            }

            var coachFeedback = "";
            if (props.showScore || props.showFeedback){
              
              coachFeedback = (
              <div className={`${bubbleContainer} ${bubbleDirection}`}>
                <div className={`coach`}>
                  {feedback}
                  {scores}
                </div>
              </div>)
              if (index == lines.length - 1){
                coachFeedback = (<SpringIn>{coachFeedback}</SpringIn>)
              }
            }
            if (index == lines.length - 1){
              return(
                /*style={{width:`${props.config.$.optionsWidth}`, height:`${props.config.$.optionsHeight}`, right:`${props.config.$.optionsX}`, top:`${props.config.$.optionsY}`}}*/
                <MoveUp><div key={l.$.id+index.toString()} className={`${vwrapper}`} style={minHeight}>
                  <div className={`${bubbleContainer} ${bubbleDirection}`}>
                    <div className={`bubble ${bubbleClass}`}><span class="numbering">{l.numbering}</span>{l.text[0]}</div>
                  </div>
                  {coachFeedback}
              </div>
              </MoveUp>
              )
            }
            else{
              return (<div key={l.$.id+index.toString()} className={`${vwrapper}`} style={minHeight}>
                  <div className={`${bubbleContainer} ${bubbleDirection}`}>
                    <div className={`bubble ${bubbleClass}`}><span class="numbering">{l.numbering}</span>{l.text[0]}</div>
                  </div>
                  {coachFeedback}
              </div>)
            }
          }
          else{
            if (index == lines.length - 1){
              minHeight = ({'min-height':`${props.lastHeight}px`})
              return (
                <MoveUp><div  key={l.$.id+index.toString()} className={`${bubbleContainer} ${bubbleDirection}`} style={minHeight}>
                  <div className={`bubble ${bubbleClass}`}><span class="numbering">{l.numbering}</span>{l.text[0]}</div>
                </div></MoveUp>)
            }
            else{
              return (
                <div  key={l.$.id+index.toString()} className={`${bubbleContainer} ${bubbleDirection}`} style={minHeight}>
                  <div className={`bubble ${bubbleClass}`}><span class="numbering">{l.numbering}</span>{l.text[0]}</div>
                </div>)
            }
          
          }
          
        }
      }
    });

    if (lines.length > 8 && loadMore[0]==false && props.action[0] != "review"){
      //Add a more button
      listItems.unshift((<div class="option-wrapper" key="more">
      <Button variant="light" 
        onClick={() => onLoadMore()}> 
        展開全部...
      </Button>
      </div>))
    }

    function makeScores(scores){
      if (scores){
        var scoreDetails = scores[0].score.map(s => {
          //Get Score detail from objective config
          var scoreDetail;
          
          props.config.objectives[0].category.forEach(c => {
            var objective = c.objective.filter(o=>{
              return  o.$.id == s.$.objective;
            })[0]; 
            if (objective){
              scoreDetail = objective
            }
          });
          scoreDetail.$.score = s._
          scoreDetail.$.class = "score-feedback" + s._
          return scoreDetail
        });
        return (<span>{scoreDetails.map(makeScore, this)}</span>);
      }
      else{
        return(<span></span>)
      }
    }
  
    function makeScore(scoreDetail) {
        return (
            <span key={scoreDetail.$.id} class={scoreDetail.$.class}>{scoreDetail.$.name}:{scoreDetail.$.score}/5</span>
        );
    }
      
    function makeOptions(showOptions, optionIds){
      if (showOptions && optionIds){
          var links = optionIds[0].link;
          var options = links.map(o => {
            
            var option = props.config.nodes[0].option.filter(function(item) {
                return item.$.id == o.$.optionId;
              })[0];
              if (option){
                if (o.$.answer){
                  option.$.answer = o.$.answer
                }
                return option;
              }
              else{
                return o.$.optionId;
              }
              
          });
    
          var makeOption = makeButton;
          if (props.mode == "coach"){
            makeOption = makeCoachButton;
        }
      
        var title = "請選擇最佳選項:";
        if (optionIds[0].$ && optionIds[0].$.header){
          title = optionIds[0].$.header;
        }

        var audioPlayer = (<ReactAudioPlayer ref={audioRef} controls = {false} src = {sourceUrl} autoPlay={true} loop={false} onEnded={onOptionAudioEnded}/>);
        return (<div class="option-container" key="option" ref={optionsRef}><FadeOut><div class="option-title" key="optionTitle"><div>{title}</div></div></FadeOut>{options.map(makeOption, this)}{audioPlayer}</div>);
      }
      else{
        return(<div ref={optionsRef}></div>)
      }
    }
    function makeButton(option, index) {
      var numbering = "";
      var numberings = ["A","B","C","D","E"];
      if (option && option.$ && option.$.id){
        numbering = numberings[index];
        option.numbering = numbering
        return (
          <FadeOut>
            <div class="option-wrapper" key={option.$.id} id={option.$.id}>
            <Button variant="option" 
              onClick={() => onOptionSelected(option)}> 
              <span class="numbering">{numbering}</span>{option.text[0]}
            </Button>
            </div>
        </FadeOut>
        );
      }
      else{
        return (
          <div class="hwrapper">
            [系統設定錯誤，找不到選項: {option}]
          </div>
        );
      }
    }
    
    
    function makeCoachButton(option, index) {
      var scores = "";
      if (props.showScore){
        scores = (<div>{makeScores(option.scores)}</div>);
      }
      var feedback = "";
      if (props.showFeedback){
        feedback = (<div>{option.feedback}</div>)
      }
      var numbering = "";
      var numberings = ["A","B","C","D","E"];
      if (option && option.$ && option.$.id){
        numbering = numberings[index];
        option.numbering = numbering
        if (props.showFeedback || props.showScore){
          return (
            <FadeOut>
              <div class="option-wrapper-coach" key={option.$.id} id={option.$.id}>
                  <OverlayTrigger trigger="click" placement="left" show={ option.$.id === selectedOptionId} onToggle={function(e){
                    if (e == true){
                      setSelectedOptionId(option.$.id)
                    }
                    else{
                      setSelectedOptionId("0")
                    }
                  }} overlay={
                    <Popover id="popover-basic">
                    <Popover.Title as="h3">教練回饋</Popover.Title>
                    <Popover.Content>
                      {feedback}{scores}
                    </Popover.Content>
                  </Popover>
                  }>
                  <img class="img-coach" src="assets/images/coach.png" width="30" height="30"/>
                  </OverlayTrigger> 
                  <Button variant="option" 
                      onClick={() => onOptionSelected(option)}> 
                      <span class="numbering">{numbering}</span>{option.text[0]}
                  </Button>
              </div>
            </FadeOut>
          );
        }
        else{
          return (
            <FadeOut>
              <div class="option-wrapper" key={option.$.id} id={option.$.id}>
                  <Button variant="option" 
                      onClick={() => onOptionSelected(option)}> 
                      <span class="numbering">{numbering}</span>{option.text[0]}
                  </Button>
              </div>
            </FadeOut>
          );
        }
      }
      else{
        return (
          <div class="hwrapper">
            [系統設定錯誤，找不到選項: {option}]
          </div>
        );
      }
    }
   
    var  fillPage = ({'height':`${props.fillPage}`})

    return (<div className="dialogueContainer" style={{width:`${props.config.$.optionsWidth}`, height:`${props.config.$.optionsHeight}`, right:`${props.config.$.optionsX}`, top:`${props.config.$.optionsY}`}}>
      <div className="dialogue" >
      <div class="fill-page" style={fillPage}></div>
      {listItems}
      <animated.div class="end-page" ref={messagesEndRef}/>
    </div></div>);
  }
}

  
