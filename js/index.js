var currentUser = Parse.User.current();
if (currentUser) {
  location.assign("home/index.html");
}
