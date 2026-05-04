import React from 'react';

export default function TabEmbed(props){
 
    return (
      <div>
        <div className="iframe-background">下載中。。。</div>
        <iframe src={props.url}
        width="100%"
        height="100%"
        id="myId"
        className="fullscreen"
        display="block"/>
      </div>
    )
}
