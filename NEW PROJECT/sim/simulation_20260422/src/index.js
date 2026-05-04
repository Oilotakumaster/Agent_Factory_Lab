/** @jsxRuntime classic */
import 'react-app-polyfill/ie11'
import "react-app-polyfill/stable";
import 'abortcontroller-polyfill';

// IE11 needs "jsxRuntime classic" for this initial file which means that "React" needs to be in scope
// https://github.com/facebook/create-react-app/issues/9906
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Course from './screens/course';
import coursesXml from './courses/Courses.xml';
import copyrightXml from './Copyright.xml';
import StackGrid, { transitions } from "react-stack-grid";
import {Image, Button, Form} from "react-bootstrap";
import Modal from 'react-modal';
import { getCourses, validateLogin} from './screens/courseService';
import {Container} from "react-bootstrap";
const { scaleDown } = transitions;

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#app')

function App() {
  const [isHovered, setHover] = useState(null);
  const [course, setCourse] = useState(null);
  const [userCourses, setUserCourses] = useState(["1", "4", "5", "7", "36", "39", "34", "35", "33", "29", "32", "31", "28", "30", "27", "26", "23", "21", "22", "25", "24"]);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  var courses, copyright

  const refGrid = React.useRef(null);
  var parseString = require('xml2js').parseString;

  if (userId != null && password != null){
    parseString(copyrightXml, function (err, result) {
      copyright = result.copyright;
      copyright.userId = userId;
      if (course != null){
        copyright.$.courseid = course.$.id
      }
    });
  }
  
  function onLoginClick() {
    
    //validate login
    setErrorMsg("登入中。。。")
    getCourses(copyright, userId, password).then(function(result){
     if (result && result.length>0){
        setUserCourses(result)
        setErrorMsg("")
     }
     else
     {
        setPassword("");
        setErrorMsg("帳號，密碼，或課程設定錯誤，無法登入!")
     }
   }) 
   
  }

  function validateSubmit(){
    return (userId != null && password != null);
  }

  function onButtonClick(courseid){
    
    //Enter course
    var courseXml = require('./courses/' + courseid.toString() + "/Content.xml");
    
    var parseString = require('xml2js').parseString;
    parseString(courseXml.default, function (err, result) {
      if (result.course){
        result.course.$.id = courseid
        copyright.$.courseid = courseid
        validateLogin(copyright, userId, password)
        setCourse(result.course);
      }
    }.bind(this));
    
  }

  function onMouseOver(index){
    if (isHovered == null){
      setHover(index)
      refGrid.current.updateLayout();
    }
  }

  function onMouseLeave(){
    if (isHovered != null){
      setHover(null)
    
      setTimeout(function(){
        refGrid.current.updateLayout();
      },500);
    }
  }
  function onBackButtonClick(index){
    setCourse(null);
    setHover(null);
  }

  function isEmbed(){
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
  }

  function buildLogin(){

    return (
      <div className="course-body">
          <div>
            <img src="./assets/courses/title.png"></img>
          </div>
          <Container>
          <div className="login">
            <Form>
              <Form.Group size="lg" controlId="email">
                <Form.Label>帳號</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </Form.Group>
              <Form.Group size="lg" controlId="password">
                <Form.Label>密碼</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
            <p></p>
              <Button block size="lg" disabled={!validateSubmit()} onClick={onLoginClick}>
                登入
              </Button>
              <p></p>
              <Form.Group block size="lg" controlId="message">
                <Form.Label>{errorMsg}</Form.Label>
              </Form.Group>
            </Form>
          </div>
          </Container>
      </div>)
  }

  function buildPage(){
    var parseString = require('xml2js').parseString;
    parseString(coursesXml, function (err, result) {
      if (result.courses){
        courses = result.courses;
      } 
    });
    
    if (userCourses){
      var otherCourses = [];
      var courseItems = courses.course.map((c, index) => {
        if (userCourses.indexOf(c.$.id) >= 0){
          return (<div key={index} className="coursecard" 
                  style={{opacity: isHovered == null ? 1 : isHovered == index ? 1:1}}
                  onMouseOver={() => onMouseOver(index)}
                  onMouseLeave={() => onMouseLeave(null)}>
            <div>
              <Image src={courses.$.folder + c.$.src} width="280px" height="200px" style={{opacity: isHovered == index ? 0.4 : 1}}/>
            {isHovered == index && (
            <Button
              variant="secondary"
              size="lg"
              style={{
                position: "absolute",
                top: "100px",
                left: "110px",
              }}
              onClick={onButtonClick.bind(this, c.$.id)}
            >
              進入課程
            </Button>
            )}
            </div>
            <div style={{opacity: isHovered == index ? 1 : 0.8}}><p></p><p><b>{c.$.label}</b></p></div>
            <div style={{opacity: isHovered == index ? 1 : 0.8, height: isHovered == index ? "100%":"220px", minHeight:"220px", overflow:isHovered == index ?'visible':'hidden'}}>{c._}</div>
            <fade style={{opacity: isHovered == index ? 0 : 1}}/>
          </div>);
        }
        else{
          //not open
          otherCourses.push(c.$.id);
        }
       }
      )  
      
      var otherItems = courses.course.map((c, index) => {
        if (otherCourses.indexOf(c.$.id) >= 0){
          return (<div key={index} className="coursecardlock" 
                  style={{opacity: isHovered == null ? 1 : isHovered == index ? 1:1}}
                  onMouseOver={() => onMouseOver(index)}
                  onMouseLeave={() => onMouseLeave(null)}>
            <div>
              <Image src={courses.$.folder + c.$.src} width="280px" height="200px" style={{opacity: isHovered == index ? 0.4 : 1}}/>
            {isHovered == index && (
            <Button
              variant="secondary"
              size="lg"
              style={{
                position: "absolute",
                top: "100px",
                left: "110px",
              }}
            >
              <div className="lock"></div>
            </Button>
            )}
            </div>
            <div style={{opacity: isHovered == index ? 1 : 0.8}}><p></p><p><b>{c.$.label}</b></p></div>
            <div style={{opacity: isHovered == index ? 1 : 0.8, height: isHovered == index ? "100%":"220px", minHeight:"220px", overflow:isHovered == index ?'visible':'hidden'}}>{c._}</div>
            <fade style={{opacity: isHovered == index ? 0 : 1}}/>
          </div>);
        }
      }
     ) 

     courseItems = courseItems.concat(otherItems);
      return(
        <div className="course-body">
          <div>
            <img src="./assets/courses/title.png"></img>
          </div>
          <div>
            <StackGrid gridRef={r => (refGrid.current = r)}
             className="stack-grid"
            appear={scaleDown.appear}
            appeared={scaleDown.appeared}
            enter={scaleDown.enter}
            entered={scaleDown.entered}
            leaved={scaleDown.leaved}
            columnWidth={320}
            gutterWidth={20}
            gutterHeight={20}
            duration={0}
            >
            {courseItems}
            </StackGrid>
          </div>
        </div>
      )
  }
  else{
    return (<div/>);
  }
 
}

function buildCourse(){
  const modalStyle = {
    overlay: {
      zIndex: 1000,
      backgroundColor: 'white',
    },
    content: {
      backgroundColor: 'white',
      overflow: 'hidden', // Needed, otherwise keyboard shortcuts scroll the page
      border: 'none',
      borderRadius: 5,
      padding: 10,
      top: 0,
      left: 15,
      right: 15,
      bottom: 15
    },
  };

  
    return(
          <div className="course-body"> 
            <Course course={course} copyright={copyright}/>
            <button
              type="button"
              key="close"
              aria-label="X"
              className="closeButton"
              style={{
                position: "absolute",
                top: "2px",
                right: "5px",
                zIndex: "99"
              }}
              onClick={onBackButtonClick.bind(this)}
            ></button>
          </div>
    )
}

if (userCourses == null && !isEmbed()){
  return buildLogin();
}
else if(userCourses == null && isEmbed()){
  return (<div></div>)
}
if (course != null){
  return buildCourse();
}
else{
  return buildPage();
}
  
}
ReactDOM.render(<App />, document.getElementById('app'));