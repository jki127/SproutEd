var classes = []; //Array with the current user's classes which is set after the loadClasses function is called
var threadDone = 0;
var classDone = 0;
window.onload = function () {
    localStorage.threadId = null;
    localStorage.classId = null;
    var currentUser = Parse.User.current();
    if (currentUser) {
        var currentUserId = currentUser.id;
        $('#greetUser').html(currentUser.get("name") + "'s Classes");
        loadClasses(currentUser, currentUser.get("classIds"));
    } else {
        window.location.assign("../index.html");
    }

    var logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        Parse.User.logOut();
        window.location.assign("../index.html");
    }, false);
    $('#search-button').on("click",function(){
        var searchinput = document.getElementById("search-input").value;
        onSearch(searchinput);
    });

}

/*Queries all the classes and then adds them to
to the nav menu. Calls the loadThreads function
if successful*/
    /*User - classIds - class - classOBGID*/
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
                c += "<i class='red icon-comments-alt icon-large'></i> "
                c += className;
                c += "</li>";
                $("#nav").html(c);
            })
        loadThreads(currentUser.id);
    }).then(function(){
        $('#nav li[id]').on("click", function(){
                var id = $(this).attr('id');
                clickClass(id);
            });
    });
}
/*Queries all the threads and then adds them to
the homepage*/
function loadThreads(currentUserId) {
    console.log("Load Threads"); //For debugging
    var displayThreads = function (thread, author) {
        t = $('#messages').html();
        t += "<div id='" + thread.id + "' >";
        t += "<span>" + thread.get("name")+ "</span>";
        t += "<div id='more'>";
        t += thread.get("description");
        t += "</div>";
        t += "<div class='author'>"
        t += author.get("name");
        t += "</div>"
        t += "</div>";
        $('#messages').html(t);
    }

    var getAuthor = function(thread, threadAuthorId){
        var User = Parse.User;
        //var threadAuthorId = thread.get("ownerId");
        var queryUser = new Parse.Query(User);
        queryUser.equalTo("objectId", threadAuthorId);
        var userPromise = queryUser.first();
        return userPromise;
    };
    /*Goes through the global classes array and
    gets the latest thread(only one) of that Class
    */
    var threadPromises = [];
    for (var i = 0; i < classes.length; i++) {
        var Thread = Parse.Object.extend("Thread");
        var queryThread = new Parse.Query(Thread);

        var aClass = classes[i];
        var threadIds = aClass.get("threadIds");
        var threadId = threadIds[threadIds.length - 1];
        queryThread.equalTo("objectId", threadId);
        var threadPromise = queryThread.first();
        threadPromises.push(threadPromise);
    }
    var authorPromise = [];
    //At this point, the threads have been sorted
    var threads = [];
    Parse.Promise.when(threadPromises).then(
        function(){
            threads = arguments;
            for(var i = 0; i < threads.length; i++){
                if(threads[i]){
                    authorPromise.push(getAuthor(threads[i],threads[i].get("ownerId")));
                //Get the author of each thread 1-by-1
                }
            }
            return authorPromise;
        }
    ).then(function(authorPromise){
        Parse.Promise.when(authorPromise).then(function(){
        var authors = arguments;
        for(var i = 0; i < threads.length; i++){
            displayThreads(threads[i], authors[i]);
        }

        $('#messages > div').on("click", function(){
            var id = $(this).attr('id');
            clickThread(id);
        });
        
    })
    });
}

/*Loads and displays all messages from a clicked
thread on a different page*/
//ThreadId - Thread - MessageIds - Message - AuthorId+Content
var clickThread = function(id){
        console.log("THREAD CLICKED");
        localStorage.threadId = id;
        window.location.assign("thread/index.html");
};
/*Loads and displays all threads from a clicked
class on a different page*/
var clickClass = function(id){
    console.log("CLASS CLICKED");
    localStorage.classId = id;
    window.location.assign("class/class.html");
};

function onSearch(text){
    localStorage.tag = text;
    window.location.assign("tag/tag.html");
}
