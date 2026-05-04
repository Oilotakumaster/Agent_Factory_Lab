/** @jsxRuntime classic */
import 'react-app-polyfill/ie11'
import "react-app-polyfill/stable";

// IE11 needs "jsxRuntime classic" for this initial file which means that "React" needs to be in scope
// https://github.com/facebook/create-react-app/issues/9906
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Container} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import Course from './screens/course';
import './assets/font/DFT_R7.TTC';
//import './assets/font/DFT_R7U.TTF';
import contentXml from './Content.xml';
import copyrightXml from './Copyright.xml';
import { validateLogin } from './screens/courseService';

function App() {
  const [login, setLogin] = useState(["loading"]);

  var copyright, expired, chapter,course
  var parseString = require('xml2js').parseString;

  parseString(copyrightXml, function (err, result) {
    copyright = result.copyright
    
    if (Date.parse(copyright.expiration[0]) < Date.now()){
      expired = true;
    } 

    parseString(contentXml, function (err, result) {
      if (result.course){
        course = result.course;
        course.$.id = copyright.$.courseid;
      }
      if (result.node && result.node.$.type == "chapter"){
        chapter = result.node;
      }  
    });
  });

  //var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

  //base64regex.test("SomeStringObviouslyNotBase64Encoded...");             // FALSE
  //base64regex.test("U29tZVN0cmluZ09idmlvdXNseU5vdEJhc2U2NEVuY29kZWQ=");   // TRUE
  if (copyright.$.bypassLogin === "true"){
    login[0] = "success";
  }
  else if (login[0] === "loading"){
    if (copyright.webServiceUrl && copyright.webServiceUrl[0].length >0){
      validateLogin(copyright).then(function(result){
        setLogin([result]);
      })
    }
    else{
      login[0] = "failed";
    }
}
 
function buildPage(){
    //Rendering...
  if (expired === true){
    return(
      <div>
        {copyright.expireText}
      </div>
    )  
  }
  else if (login[0] === "failed"){
    return (
      <div>
        Login Failed!
      </div>
    )
  }
  else if (login[0] === "loading"){
    return ""
  }
  else{
    
    var fluid = { ["fluid"]: "xl" };
    if (copyright.$.isWebObject=="true"){
      fluid = {["fluid"]: true};
    }
   
    return(
      <Container {...fluid}>
          <Course course={course} chapter={chapter} copyright={copyright}/> 
      </Container>
    )
    
    }
  }
  
  return buildPage();
}
ReactDOM.render(<App />, document.getElementById('app'));