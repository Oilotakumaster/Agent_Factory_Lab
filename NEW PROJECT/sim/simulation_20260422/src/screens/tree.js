import React,{useState, useEffect} from 'react';
import {Treebeard} from 'react-treebeard';

export default function Tree(props){


var treestyle = {
          tree: {
              base: {
                  listStyle: 'none',
                  backgroundColor: 'white',
                  color: 'black',
                  margin: 0,
                  padding: 0,
                  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
                  fontSize: '1rem',
                  height: '100%'
              },
              node: {
                  base: {
                      position: 'relative'
                  },
                  link: {
                      cursor: 'pointer',
                      position: 'relative',
                      padding: '5px 5px',
                      display: 'block',
                  },
                  activeLink: {
                      background: 'lightblue',
                  },
                  toggle: {
                      base: {
                          position: 'relative',
                          display: 'inline-block',
                          verticalAlign: 'top',
                          marginLeft: '0px',
                          height: '24px',
                          width: '24px'
                      },
                      wrapper: {
                          position: 'absolute',
                          top: '30%',
                          left: '50%',
                          margin: '-7px 0 0 -7px',
                          height: '14px'
                      },
                      height: 14,
                      width: 14,
                      arrow: {
                          fill: '#9DA5AB',
                          strokeWidth: 0
                      }
                  },
                  header: {
                      base: {
                          display: 'inline-block',
                          verticalAlign: 'top',
                          color: 'black'
                          //color: '#9DA5AB'
                      },
                      connector: {
                          width: '2px',
                          height: '12px',
                          borderLeft: 'solid 2px black',
                          borderBottom: 'solid 2px black',
                          position: 'absolute',
                          top: '0px',
                          left: '-21px'
                      },
                      title: {
                          lineHeight: '24px',
                          verticalAlign: 'middle'
                      }
                  },
                  subtree: {
                      listStyle: 'none',
                      paddingLeft: '19px'
                  },
                  loading: {
                      color: '#E2C089'
                  }
              
          }
  }
}
const [cursor, setCursor] = useState(false);
var firstNode;

var buildTree = function(parent, isFirst){
    var nextIsFirst = isFirst
    if (parent.$.type == "chapter"){
        nextIsFirst = false
    }

    var treeNode = buildTreeNode(parent, nextIsFirst)

    if (parent.$.type == "chapter" && isFirst){
        firstNode = treeNode
    }

    return treeNode
}

var buildTreeNode = function(parent, isFirst){
    if (parent.node && parent.node.length > 0){
        return {
            name: parent.$.label,
            toggled: isFirst,
            children:  buildList(parent, isFirst)
        };
    }
    else{
        return {
            name: parent.$.label,
        }
    }
}

var buildList = function(parent, isFirst){
    
    return parent.node.map(function(node,index){
        if (node.$.type == "chapter"){
            chapters[node.$.label] = node;
        }
        if (isFirst && index == 0 ){
            isFirst = true
        }
        else{
            isFirst = false
        }
        return buildTree(node, isFirst)
    })
}

var chapters = {};
var dataJson = buildTree(props.course, true)

const [data, setData] = useState(dataJson);

useEffect(function(){
   if (!cursor){
    onToggle(firstNode);
   }
},[])

const onToggle = (node, toggled) => {
    if (cursor) {
        cursor.active = false;
    }
    node.active = true;
    if (node.children) {
        node.toggled = toggled;
    }
    setCursor(node);
    setData(Object.assign({}, data))

    //raise selected chapter back up
    if (chapters[node.name]){
        props.nodeSelected(chapters[node.name]);
    }
}

return (
  <Treebeard
      className="tree"
      data={data}
      style={treestyle}
      onToggle={onToggle}
  />
);
}
