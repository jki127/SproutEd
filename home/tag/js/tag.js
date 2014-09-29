//classId - class = threadId - thread = name, desc + author
$(document).ready(function () {
  var currentUser = Parse.User.current();
  if (currentUser) {
    $('#greetUser').html(currentUser.get("name") + "'s Classes");
    loadClasses(currentUser, currentUser.get("classIds"));
  }

  var tag = localStorage.tag;
  if (tag) {
    $('#tagName').html(tag);
    loadThreads(tag);
  }

  var logout = document.getElementById("logout");
  logout.addEventListener("click", function () {
    Parse.User.logOut();
    window.location.assign("../../index.html");
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
});

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
      var className = value.get("name");
      c += "<li id='" + value.id + "' >";
      c += "<i class='red icon-comments-alt icon-large'></i> ";
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


var loadThreads = function (tag) {
  var getAuthor = function (thread) {
    var threadAuthorId = thread.get("ownerId");
    var User = Parse.User;
    var queryUser = new Parse.Query(User);
    queryUser.equalTo("objectId", threadAuthorId);
    var userPromise = queryUser.first();
    return userPromise;
  };
  var displayThreads = function (thread, author) {
    t = $('#threads').html();
    t += "<div id='" + thread.id + "' >";
    t += "<span>" + thread.get("name") + "</span>";
    t += "<div id='more'>";
    t += thread.get("description");
    t += "</div>";
    t += "<div class='author'>"
    t += author.get("name");
    t += "</div>"
    t += "</div>";
    $('#threads').html(t);
  }

  var Thread = Parse.Object.extend("Thread");

  var queryThread = new Parse.Query(Thread);
  queryThread.equalTo("tags", tag);

  queryThread.find().then(function (threads) {
    console.log(threads);
    var threadPromises = [];
    for (var i = 0; i < threads.length; i++) {
      var threadId = threads[i].id;

      var Thread = Parse.Object.extend("Thread");
      var queryThread = new Parse.Query(Thread);
      queryThread.equalTo("objectId", threadId);
      threadPromises.push(queryThread.first());
    }

    return threadPromises[0];
  }).then(function () {
    var threads = arguments;
    var authorPromises = [];
    for (var i = 0; i < threads.length; i++) {
      authorPromises.push(getAuthor(threads[i]));
    }
    Parse.Promise.when(authorPromises).then(function () {
      authors = arguments;
      for (var i = 0; i < authors.length; i++) {
        displayThreads(threads[i], authors[i]);
      }
      $('#threads > div').on("click", function () {
        var id = $(this).attr('id');
        clickThread(id);
      });
    });
  });
};

var clickClass = function (id) {
  console.log("CLASS CLICKED");
  localStorage.classId = id;
  window.location.assign("../class/class.html");
};

var clickThread = function (id) {
  console.log("THREAD CLICKED");
  localStorage.threadId = id;
  window.location.assign("../thread/index.html");
};

function onSearch(text){
    localStorage.tag = text;
    window.location.assign("../tag/tag.html");
}
