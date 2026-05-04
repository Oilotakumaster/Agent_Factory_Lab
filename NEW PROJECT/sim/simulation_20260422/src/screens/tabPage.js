import React,{useState} from 'react';
import {Carousel} from "react-bootstrap";

export default function Tab1(props){
  var pageCount = 1;
  const [index, setIndex] = useState(0);
  
  if (pageCount > 1){
    if (!props.btnMain1.action){
      props.btnMain1.text = "上一頁";
      props.btnMain1.action = "back";
  
      props.btnMain2.text = "下一頁";
      props.btnMain2.action = "next";
      props.onButtonUpdate();
    }
  
    let action = props.action;
  
    if (action[0] == "next"){
      if (index < pageCount - 1){
        setIndex(index + 1)
      }
    }
    else if (action[0] == "back"){
      if (index > 0){
        setIndex(index - 1)
      }
    }
    action[0] = "none"
  }

  var page = (<div className="page-text" dangerouslySetInnerHTML={{ __html: props.content }}></div>)
  if (props.config.type == "imageText"){
    page = (
      <div className="relative">
        <img className="absolute-lt" src={props.config.background} width="100%" height="100%"/>
        <div className="page-textimage" dangerouslySetInnerHTML={{ __html: props.content }}/>
      </div>
    );
  }

  return (
    <Carousel activeIndex={index} interval={null} fade={true} controls={false} indicators={false}> 
      <Carousel.Item>
        {page}
      </Carousel.Item>
      <Carousel.Item>
     page 2
      </Carousel.Item>
      <Carousel.Item>
     page 3
      </Carousel.Item>
  </Carousel>
  );
}
