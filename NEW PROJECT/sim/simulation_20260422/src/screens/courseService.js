
export const validateLogin = function(copyright, userId, password){
    
        //login
        var serverUrl = copyright.webServiceUrl[0];
        var url = serverUrl + "/validatelogin/" + userId + "/" + password + "/" + copyright.$.courseid
        //var url = "https://courseserviceazure20210307212905.azurewebsites.net/course/validatelogin/kj/1234/32"
        return fetch(url).then(function(res){
            return res.json();
        }).then((data) => {
        console.log(data);
        if (data && data ==="0"){
            //login success
            return "success"
        }
        else{
            return "failed"
        }
        })
        .catch((ex)=>{
            console.log(ex.toString());
            return "failed"
        })
  
}

export const getCourses = function(copyright, userId, password){
  
  //login
  var serverUrl = copyright.webServiceUrl[0];
  var url = serverUrl + "/login/" + userId + "/" + password
  //var url = "https://courseserviceazure20210307212905.azurewebsites.net/course/login/kj/1234"
  return fetch(url).then(function(res){
      return res.json();
  }).then((data) => {
    console.log(data);
    return data;
  })
  .catch((ex)=>{
      console.log(ex.toString());
     return "failed"
     
  })
  

}

export const insertLog = function(config){
  
    var id = 0
    if (config.nodes){
      var pages = config.nodes[0].page
      id = pages[0].$.id;
    }
    
    if (config.copyright.userId && config.chapterId && config.copyright.webServiceUrl && config.copyright.webServiceUrl[0].length >0){ //&& config.copyright.userId){
      //Insert log
      var serverUrl = config.copyright.webServiceUrl[0];
      //config.copyright.$.courseid and config.copyright.userId is set in index.js when user login and select a course
      var url = serverUrl + "/insertlog/" + config.copyright.userId + "/" + config.copyright.$.courseid + "/" + config.chapterId + "/" + config.lessonId + "/" + id;
       return fetch(url).then(function(res){
        return res.json();
      }).then((data) => {
        console.log(data);
      })
      .catch((ex)=>{
        console.log(ex.toString());
      }) 
    }
  }

export const insertScore = function(config, score){
     if (config.copyright.userId && config.copyright.webServiceUrl && config.copyright.webServiceUrl[0].length >0){// && config.copyright.userId){
        //Insert score
        var serverUrl = config.copyright.webServiceUrl[0];
        var url = serverUrl + "/insertscore/" + config.copyright.userId + "/" + config.copyright.$.courseid + "/" + config.scene + "/" + score.toString();
         return fetch(url).then(function(res){
          var result = res;
          return res.json();
        }).then((data) => {
          console.log(data);
        })
        .catch((ex)=>{
          console.log(ex.toString());
        }) 
      }
    
};