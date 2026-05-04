import React, {useState, useRef} from 'react';
import ReactPlayer from 'react-player';
import {Carousel} from "react-bootstrap";

export default function VideoPlayer (props){
    const videoRef = useRef(null);
    const idleRef = useRef(null);
    
    var idle = props.idle;
    var playing = props.playing;
    var index = 1;
    var videoConfig = {}
    const [paused, setPaused] = useState(true);
    var play = playing;
    var idleUrl;

    if (props.action[0] == "replay" && paused){
        setPaused(false);
        videoRef.current.seekTo(0);
    }
    
    if (idle[0] == true || props.action[0] == "review"){
        index = 1;
        play = false;
    }
    else{
        if (paused == false){
            index = 0;
        }
    }
    
    if (idleRef.current == null){
        idleUrl = props.idleUrl;
    }
    else{
        if (index == 0){
           idleUrl = props.idleUrl;
        }
        else{
            idleUrl = idleRef.current.player.props.url;
        }
    }

    var onReady = function(){
        setPaused(false);
    };

    var onEnded = function(){
        idle[0] = true;
        
        if (props.action[0] == "replay"){
            props.action[0] = props.mode; //reset button back to coach or test so that it replay only once
          }
        setPaused(true);
        props.onEnded();   
    };

    return (
        <div class="absolute-lt" style={{width:`${props.config.$.characterWidth}`, height:`${props.config.$.characterHeight}`, left:`${props.config.$.characterX}`, top:`${props.config.$.characterY}`}} >
            <Carousel activeIndex={index} interval={null} slide={false} fade={false} controls={false} indicators={false} style={{width:`100%` , height:`100%`}}> 
                <Carousel.Item>
                    <ReactPlayer ref={videoRef} controls = {false} paused={paused} height={"100%"} width={"100%"} url = {props.mediaUrl} playing={play} loop={false} playsinline={true}
                     onEnded={onEnded} onReady={onReady} config={videoConfig}/>
                </Carousel.Item>
                <Carousel.Item>
                    <ReactPlayer ref={idleRef} controls = {false} height={"100%"} width={"100%"} url = {idleUrl} muted={true} playing={true} playsinline={true} loop={true} config={videoConfig}/>
                </Carousel.Item>
            </Carousel>
        </div> 
    );
  
}
