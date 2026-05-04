import React, {useState, useRef, useEffect} from 'react';
import ReactAudioPlayer from 'react-audio-player';
import {Carousel} from "react-bootstrap";
import {
    isMobile
  } from "react-device-detect";

export default function DialogPlayer (props){
    const audioRef = useRef(null);
    const imageRef = useRef(null);
    var idle = props.idle;
    var playing = props.playing;
    var index = 0;
    var play = playing;
   
    const [paused, setPaused] = useState(!play);
  
    if (props.action[0] === "replay" && idle[0] === true){
        setPaused(false);
    }

    if (idle[0] === true || props.action[0] === "review"){
        index = 1;
        play = false;
    }
    else{
        index = 0;
    }

    var onEnded = function(){
        idle[0] = true;
        if (props.action[0] === "replay"){
            props.action[0] = props.mode; //reset button back to coach or test so that it replay only once
            setPaused(true);
        }
        
        props.onEnded();   
    };

   // var onReady = function(){
        //setPaused(false);
   //};

   var onImageLoad = function(){
   // setPaused(false);
   };

   
   useEffect(function(){
    if (audioRef.current){
         if (play === true && paused === false){
              
            var playPromise = audioRef.current.audioEl.current.play();
                
             if (playPromise !== undefined) {
                 playPromise.then(_ => {
                     // Automatic playback started!
                 })
                 .catch(error => {
                 });
             }
          }
          //else if (play == true && paused == true){
              //if (idle[0] == false){
                  //setPaused(false);
              //}
          //}
          else{
              audioRef.current.audioEl.current.pause();
          }
      }
   },[audioRef, play, paused])
    
    var character = ""
    if (props.graphicUrl && !isMobile){
        var url
       
        if (index === 0){ 
            url = props.graphicUrl;
        }
        else{ //idle
            url = props.idleUrl
            //url = imageRef.current.src;
        }
        
        character = (<img ref={imageRef} class="relative" src={url} width={"100%"} height="100%" onLoad={onImageLoad}/>)
    }

    return (
        <div class="absolute-lb"  style={{width:`${props.config.$.characterWidth}`, height:`${props.config.$.characterHeight}`, left:`${props.config.$.characterX}`, bottom:`${props.config.$.characterY}`}}>
                {character}
                <ReactAudioPlayer ref={audioRef} controls = {false} src = {props.mediaUrl} autoPlay={true} loop={false} onEnded={onEnded}/>
        </div>
    );
  
}
