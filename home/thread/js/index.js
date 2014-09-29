$(document).ready(function () {

  //LOAD NAV START
  var currentUser = Parse.User.current();
  if (currentUser) {
    var classIds = currentUser.get("classIds");
    loadClasses(currentUser, classIds);
    $('#greetUser').html(currentUser.get("name") + "'s Classes");
  }

  if (localStorage.threadId) {
    var threadId = localStorage.threadId;
    setThreadName(threadId);
    loadMessages(threadId);
  } else {
    $('#messages'), html("Error.");
  }

  var logout = document.getElementById("logout");
  logout.addEventListener("click", function () {
    Parse.User.logOut();
    window.location.assign("../index.html");
  }, false);
  
  $('#search-button').on("click", function () {
    var searchinput = document.getElementById("search-input").value;
    if (searchinput) {
      onSearch(searchinput);
    }
  });
  
  $('#logo').on("click",function(){
    window.location.assign("../index.html");
  });

  $('#reply').on('click', function () {
    var messageText = document.getElementById("newMessage").value;

    if ($.trim(messageText).length) {
      $('#reply').attr("disabled", "true");

      var Message = Parse.Object.extend("message");
      var theMessage = new Message();

      theMessage.set("content", messageText);
      theMessage.set("authorId", currentUser.id);

      theMessage.save().then(function (currentMessage) {
        var messageId = currentMessage.id;

        var Thread = Parse.Object.extend("Thread");
        var queryThread = new Parse.Query(Thread);
        queryThread.equalTo("objectId", threadId);

        queryThread.first().then(function (thisThread) {
          var messageIds = [];
          if (thisThread.get("messageIds")) {
            messageIds = thisThread.get("messageIds");
          }
          messageIds.push(messageId);

          thisThread.set("messageIds", messageIds);
          thisThread.save();

          theMessage.set("threadId", thisThread.id);
          theMessage.save().then(function () {

            Parse.Push.send({
              channels: ["admin",""],
              data: {
                alert: currentUser.get("name") + " replied to your message"
              }
            });

            loadMessages(thisThread.id);
            $('#newMessage').val("");
            $('#reply').removeAttr("disabled");
          });
        });
      });
    }
  });

});

function setThreadName(threadId) {
  var Thread = Parse.Object.extend("Thread");
  var queryThread = new Parse.Query(Thread);

  queryThread.equalTo("objectId", threadId);
  queryThread.first().then(function (aThread) {
    var threadName = aThread.get("name");
    var threadHTML = "<div class='threadHTML'>"+ threadName +"</div>";
    $('#threadName').html(threadHTML);

    var tags = aThread.get("tags");
    if (tags) {
      for (var i = 0; i < tags.length; i++) {
        var tagHTML = "";
        //tagHTML +="<a href='../tag/tag.html'>";
        tagHTML += "<span class='btn btn-primary'>";
        tagHTML += "#" + tags[i] + " ";
        tagHTML += "</span>";
        //tagHTML += "</a>";
        $('#tags').append(tagHTML);
      }
      $('#tags > span').on("click", function () {
        localStorage.tag = this.innerHTML.trim().substring(1);
        window.location.assign("../tag/tag.html");
      });
    }
  });
}

function loadMessages(threadId) {
  var list = "";
  var display = function (message, author) {
    list += "<div class='message'>"
    list += "<div class='minus'>";
    if(message.get("minus")){
      list += message.get("minus");
    }
    list += "-</div>";
    if(message.get("image")){
      list += "<div class='messageImage'>";
      list += "<img ";
      list += "src='"+message.get("image")
      list += "'/>";
      list += "</div>";
    }
    list += "<span class='messageBody'>"
    list += message.escape("content");
    list += "</span>"
    list += "<div class='author'>" + author.escape("name") + "</div>"
    list += "<div class='plus'>";
    if(message.get("plus")){
      list += message.get("plus");
    }
    list += "+</div>";
    list += "</div>";
    $('#messages').html(list);
  };
  /*Gets author*/
  var getAuthor = function (message) {
    var authorId = message.get("authorId");
    var User = Parse.User;
    var queryUser = new Parse.Query(User);
    queryUser.equalTo("objectId", authorId);
    var userPromise = queryUser.first();
    return userPromise;
  }

  var Message = Parse.Object.extend("message");
  var queryMessage = new Parse.Query(Message);

  var promises = [];
  queryMessage.ascending("createdAt").equalTo("threadId", threadId);
  queryMessage.find({
    success: function (messages) {
      messages.forEach(function (value) {
        promises.push(getAuthor(value)); //Makes sure that the requests all happened
      });
      Parse.Promise.when(promises).then( //Messages are already sorted because of descending()

        function () {
          var authors = arguments;
          for (var i = 0; i < arguments.length; i++) {
            display(messages[i], arguments[i]);
          }
          $('#messages > div').on("swipeleft", function(){
            var mssg = $(this);
            mssg.animate({
              left: "-200px"
            }, 450, "swing", function () {
              setTimeout(function () {
                mssg.animate({
                  left: "0"
                }, 350);
              }, 200);
            });
          });
          $('#messages > div').on("swiperight", function(){
            var mssg = $(this);
            mssg.animate({
              left: "200px"
            }, 450, "swing", function () {
              setTimeout(function () {
                mssg.animate({
                  left: "0"
                }, 350);
              }, 200);
            });
          });
      });
    },
    error: function (error) {
      console.log(error.message);
    }
  });
}
/*Queries all the classes and then adds them to
to the nav menu. Calls the loadThreads function
if successful*/
function loadClasses(currentUser, classIds) {
  console.log("Load Classes"); //For debugging

  var Class = Parse.Object.extend("Class");
  var queryClass = new Parse.Query(Class);
  queryClass.equalTo("UserId", currentUser.id).ascending("name");
  var classPromise = queryClass.find();
  Parse.Promise.when(classPromise).then(function (userClassArray) {
    classes = userClassArray;
    var c = $("#nav").html();
    classes.forEach(function (value) {
      //Append the classes to nav menu
      var className = value.escape("name");
      c += "<li id='" + value.id + "' >";
      c += className;
      c += "</li>";
      $("#nav").html(c);
    })
  }).then(function () {
    $('#nav li[id]').on("click", function () {
      var id = $(this).attr('id');
      clickClass(id);
    });
  });
}
var clickClass = function (id) {
  console.log("CLASS CLICKED");
  localStorage.classId = id;
  window.location.assign("../class/class.html");
};

function onSearch(text){
    localStorage.tag = text;
    window.location.assign("../tag/tag.html");
}
