import React,{useState} from 'react';
import ScormProvider, { withScorm } from 'react-scorm-provider';
import SplitPane, { Pane } from 'react-split-pane';
import Chapter from './chapter';
import Tree from './tree';
import {
  isMobile
} from "react-device-detect";

export default function Course(props){
  var defaultTreeWidth = 260
  if (props.course && props.course.$.treeWidth){
    defaultTreeWidth = parseInt(props.course.$.treeWidth)
  }
  const [treeWidth, setTreeWidth] = useState(defaultTreeWidth);
  const [showTree, setShowTree] = useState(true);

  var isScorm;
  isScorm = (props.copyright.$.scorm == "true")
  if (props.copyright.$.isWebObject && props.copyright.$.isWebObject == "true"){
    isScorm = false;
  }
  var wrapChapter = function(){
    if (isScorm){
      return withScorm()(Chapter)
    }
    else{
      return Chapter
    }
  }

  var showChapter = function(nodChapter){
    if (nodChapter._){
      
      //load chapter xml
      //Enter course
      var chapterXml = require('../' + nodChapter._);
      
      var parseString = require('xml2js').parseString;
      parseString(chapterXml.default, function (err, result) {
        if (result.node && result.node.$.type == "chapter"){
          setChapter(result.node);
        }
      }.bind(this));
    }
    else{
      setChapter(nodChapter);
    }
  }

  const [chapterjson, setChapter] = useState(null);

  if (chapterjson == null){
    if (props.chapter){
      showChapter(props.chapter)
    }
    else if (props.course && props.course.node.length == 1)
    {
      showChapter(props.course.node[0])
    }
  }

  
  const [ChapterWrapper, setChapterWrapper] = useState(wrapChapter);

  var getChapter = function(){
    
    if (chapterjson){
      if (isScorm){
        return (<ScormProvider debug={true}>
              <ChapterWrapper chapter={chapterjson} copyright={props.copyright}/> 
            </ScormProvider>
          )
      }
      else{
        return (<ChapterWrapper chapter={chapterjson} copyright={props.copyright}/> )
      }
    }
    else{
    
      return (<div></div>)
    } 
  }

  var onNodeSelected = function(selectedChapter){
    showChapter(selectedChapter);
    if (isMobile){
      setShowTree(false)
    }
  };

  function onCloseButtonClick(index){
   setShowTree(false)
  }

  function onOpenButtonClick(index){
   setShowTree(true)
  }

  function toggleWidth(size){
    setTreeWidth(size)
  }

  if (props.chapter){
    return (
      <div>
        <div>{getChapter()}</div>
      </div>
    )
  }
  else if (props.course && props.course.node.length > 1){
    
    return (
      <div className="course-container">
      {/*<div><img src={props.course.$.src}></img></div>*/}
      <SplitPane className="splitpane" split="vertical" size={ (showTree ? treeWidth : 30)} allowResize={true} onChange={size => toggleWidth(size)} >
        <div  style={{width: showTree ? treeWidth : 30}}>
          <div className="tree-header" style={{width: showTree ? treeWidth : 30}}>
            <button type="button" key="close" className="arrow left" 
                style={{ position: "absolute", top: "8px", right: "4px",height: "15px", width: "15px", display: (showTree ? 'block' : 'none')}} 
                onClick={onCloseButtonClick.bind(this)}></button>
            <button type="button" key="open" className="arrow right" 
                style={{ position: "absolute", top: "8px", right: "8px",height: "15px", width: "15px", display: (showTree ? 'none' : 'block') }} 
                onClick={onOpenButtonClick.bind(this)}></button>
          </div>
          <div style={{ display: (showTree ? 'block' : 'none')}}>
            <Tree className="tree" course={props.course} nodeSelected={onNodeSelected} />
          </div>
        </div>
        <div>{getChapter()}</div>
      </SplitPane>
      </div>
    )
  }
  else if(props.course){
    return (
      <div>
        <div>{getChapter()}</div>
      </div>
    )
  }
  
}
