import React, {useState, useEffect} from 'react';
import {Tabs, Tab} from "react-bootstrap";
import TabPage from './tabPage';
import TabSimulation from './tabSimulation';
import TabScorecard from './tabScorecard';
import TabEmbed from './tabEmbed';
import {insertScore, insertLog} from './courseService';

class Chapter extends React.Component{

  constructor(props) {
    super(props);
    this.config = {};
    this.configs = {};
    this.state = { key: 'tab1',
                       playing: true,
                       scores:[],
                       startTime: Date.now(),
                       isLoad:true,
                       chapter: props.chapter.$.label
                    };

    this.onSelectTab = function(k){
        this.setState({playing:k === 'tabSimulation',
                        key:k,
                        isLoad:false,
                        chapter: this.props.chapter.$.label
        });

        //insert log - fetch config for selected tab
        if (this.configs[k]){
            insertLog(this.configs[k]);
        }
    }.bind(this);
    
    this.onScoreUpdate = function(score,status){
        //update scorm or web service with score and completion status
        if (this.props.copyright.$.scorm === "true"){
            //"passed", "completed", "failed", "incomplete", "browsed", "not attempted"
            var scoScore = {};
            scoScore.value = score;
            if (this.props.sco){
            if (this.props.sco.completionStatus === "passed"){
                //Not overwriting status
            }
            else if (this.props.sco.completionStatus === "failed"){
                if (status === "passed"){
                this.props.sco.setStatus(status)
                }
            }
            else{
                if (this.props.sco.completionStatus !== status){
                this.props.sco.setStatus(status)
                }
            }
            
            this.props.sco.set("cmi.core.session_time", this.computeTime());
            var c = this.props.sco.get("cmi.core.lesson_status");
    
            var prevScore = this.props.sco.get('cmi.core.score.raw');
            if (!prevScore || prevScore === '' || isNaN(prevScore)){
                this.props.sco.setScore(scoScore);
            }
            else{
                var prevScoreNum = parseInt(prevScore)
                if (score > prevScoreNum){
                this.props.sco.setScore(scoScore);
                }
            }
            }
        }
        else{
            if (status != "incomplete"){
                insertScore(this.config, score)
            }
        }
    }.bind(this);

    this.computeTime = function()
    {
        if ( this.state.startTime != null )
        {
            var currentTime = Date.now();
            var elapsedSeconds = ( (currentTime - this.state.startTime) / 1000 );
            var formattedTime = this.convertTotalSeconds( elapsedSeconds );
        }
        else
        {
            formattedTime = "00:00:00.0";
        }
    
        return formattedTime;
    }.bind(this)

    /*******************************************************************************
        ** this function will convert seconds into hours, minutes, and seconds in
        ** CMITimespan type format - HHHH:MM:SS.SS (Hours has a max of 4 digits &
        ** Min of 2 digits
        *******************************************************************************/
    this.convertTotalSeconds = function(ts)
    {
        var sec = (ts % 60);
    
        ts -= sec;
        var tmp = (ts % 3600);  //# of seconds in the total # of minutes
        ts -= tmp;              //# of seconds in the total # of hours
    
        // convert seconds to conform to CMITimespan type (e.g. SS.00)
        sec = Math.round(sec*100)/100;
        
        var strSec = new String(sec);
        var strWholeSec = strSec;
        var strFractionSec = "";
    
        if (strSec.indexOf(".") != -1)
        {
            strWholeSec =  strSec.substring(0, strSec.indexOf("."));
            strFractionSec = strSec.substring(strSec.indexOf(".")+1, strSec.length);
        }
        
        if (strWholeSec.length < 2)
        {
            strWholeSec = "0" + strWholeSec;
        }
        strSec = strWholeSec;
        
        if (strFractionSec.length)
        {
            strSec = strSec+ "." + strFractionSec;
        }
    
        if ((ts % 3600) != 0 )
            var hour = "0";
        else var hour = (ts / 3600).toString();
        if ( (tmp % 60) != 0 )
            var min = "0";
        else var min = (tmp / 60).toString();
    
        if ((new String(hour)).length < 2)
            hour = "0"+hour;
        if ((new String(min)).length < 2)
            min = "0"+min;
    
        var rtnVal = hour+":"+min+":"+strSec;
    
        return rtnVal;
    }

    this.buildLessonsTabs = function(){
        var tabs = this.props.chapter.lesson.map(function(lesson, index){
            var tabKey = "tab" + (index + 1).toString();
            var label = lesson.$.label
           
            if (lesson.page){

                if (lesson.page[0].$.type === "simulationRecords"){
                   
                    return (<Tab eventKey="tabScorecard" key={index} title={label}>
                            <TabScorecard scores={this.state.scores} config={this.config} />
                        </Tab>)
                }
                else{
                    var tabContent = lesson.page[0]._;
                   
                    var config = lesson.page[0].$
                    config.copyright = this.props.copyright
                    config.chapter = this.props.chapter.$.label
                    config.chapterId = this.props.chapter.$.id
                    config.lesson = lesson.$.label
                    config.lessonId = lesson.$.id
                    this.configs[tabKey] = config;
                    return (<Tab eventKey={tabKey} key={index} title={label}>
                    <TabPage content={tabContent} config={config} />
                    </Tab>)
                }
            }
            else if(lesson.simulation){
                var simConfigFile = lesson.simulation[0];
                const simXml = require('../' + simConfigFile);
                var parseString = require('xml2js').parseString;
                parseString(simXml.default, function (err, result) {
                    var config = result.simulation
                    config.copyright = this.props.copyright
                    config.chapter = this.props.chapter.$.label
                    config.chapterId = this.props.chapter.$.id
                    config.lesson = lesson.$.label
                    config.lessonId = lesson.$.id
                    config.scene = parseInt(simConfigFile.replace("S","").replace(".xml",""))
                    this.config = config
                }.bind(this));

                return(<Tab eventKey="tabSimulation" key={index} title={label}>
                            <TabSimulation config={this.config} scores={this.state.scores} playing={this.state.playing} onScoreUpdate={this.onScoreUpdate}/>
                        </Tab>)
            }
            else if(lesson.embed){
                /*
                <lesson label="SL">
                    <embed>sl/COA_1-1_web/story.html</embed>
                </lesson>
                */
                var embedFile = lesson.embed[0];

                var config = {}
                config.copyright = this.props.copyright
                config.chapter = this.props.chapter.$.label
                config.chapterId = this.props.chapter.$.id
                config.lesson = lesson.$.label
                config.lessonId = lesson.$.id
                this.configs[tabKey] = config;
                return(<Tab eventKey={tabKey} key={index} title={label}>
                            <TabEmbed config={config} url={embedFile}/>
                        </Tab>)
                }
            }.bind(this));
           
      return(
        <Tabs id="tabsSimulation" activeKey={this.state.key} onSelect={this.onSelectTab}>
            {tabs}
        </Tabs> 
      )
    };

    this.buildSLPage = function(){
        /*
        <lesson label="SL">
            <embed>sl/COA_1-1_web/story.html</embed>
        </lesson>
        */
       var config = {}
       config.copyright = this.props.copyright
       config.chapter = this.props.chapter.$.label
       config.chapterId = this.props.chapter.$.id
       config.lessonId = 0
       this.config = config
        var embedFile = this.props.chapter.embed[0];
        return(<TabEmbed config={this.config} url={embedFile}/>)
    };

    this.buildPage = function(){
        /*
            <page>courses/1/test.xml</page>
        */
       //load content..
       const pageXml = require('../' + this.props.chapter.page[0]);
        var parseString = require('xml2js').parseString;
        var page;
        parseString(pageXml.default, function (err, result) {
            page = result.page
        }.bind(this));

        var config = page.$
        config.copyright = this.props.copyright
        config.chapter = this.props.chapter.$.label
        config.chapterId = this.props.chapter.$.id
        config.lessonId = 0
        this.config = config
 
        return(<TabPage config={this.config} content={page._}/>)
    };
  }

   componentWillUnmount(){
    //"passed", "completed", "failed", "incomplete", "browsed", "not attempted"
    this.onScoreUpdate(0,"incomplete");
  }

  render(){
  
    if (this.state.isLoad == true){
        var config = {}
        config.copyright = this.props.copyright
        config.chapterId = this.props.chapter.$.id
        config.lessonId = 0
        insertLog(config);
    }

    if (this.state.isLoad == false && this.state.chapter != this.props.chapter.$.label){
        this.setState({ key: 'tab1',
        playing: true,
        scores:[],
        startTime: Date.now(),
        isLoad:true,
        chapter: this.props.chapter.$.label
     });
    }

    if (this.props.chapter.lesson && this.props.chapter.lesson.length > 1){
        return this.buildLessonsTabs();
    }
    else if (this.props.chapter.embed){
        return this.buildSLPage();
    }
    else if (this.props.chapter.page){
        return this.buildPage();
    }
    
  }
}
export default Chapter;