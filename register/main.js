function checkPassConfirm() {
  var pass = document.getElementById("pass");
  var conpass = document.getElementById("conpass");
  var mismatch = document.getElementById("mismatch");

  if (conpass.value != "" && conpass.value != pass.value) {
    mismatch.innerHTML = "The passwords don't match!";
    return false;
  }
  else {
    mismatch.innerHTML = "";
    return true;
  }
}

function validate() {
  if (validateUsername() && validatePassword() && validateSchool() && validateEmail()) {
    addUser();
    return true;
  }
}


function validateUsername() {
  var uwarn = document.getElementById("uwarn"); //Spaces to tell user of error
  var username = document.getElementById("user").value;
  //true means the username contains a space
  if (/\s/g.test(username)) {
    uwarn.innerHTML = "Your username cannot contain any spaces";
    return false;
  }
  else if (username == "") {
    uwarn.innerHTML = "Your username cannot be blank";
    return false;
  }
  else if (username.length < 5) {
    uwarn.length = "Your username must be atleast 4 characters";
    return false;
  }
  else {
    return true;
  }
}

function validatePassword() {
  var pwarn = document.getElementById("pwarn");
  var password = document.getElementById("pass").value;

  if (password == "") {
    pwarn.innerHTML = "Your password cannot be empty";
    return false;
  }
  else if (password.length < 6) {
    pwarn.length = "Your username must be atleast 6 characters";
    return false;
  }
  else {
    return true;
  }
}

function validateSchool() {
  var swarn = document.getElementById("swarn");
  var school = document.getElementById("school").value;

  if (school == "") {
    swarn.innerHTML = "You need to include your school";
  } else {
    return true;
  }
}

function validateEmail() {
  var email = $('#email').val();
  var ewarn = $('#ewarn');
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  if (!emailReg.test(email)) {
    ewarn.html("Please enter a valid Email Address");
  } else if (email == "") {
    ewarn.html("You must enter an Email Address");
  } else {
    return true;
  }
}

function addUser() {
  var user = new Parse.User();

  var username = $('#user').val();
  var password = $('#pass').val();
  var school = $('#school').val();
  var email = $('#email').val();

  user.set("username", username);
  user.set("password", password);
  user.set("school", school);
  user.set("email", email);

  user.signUp(null, {
    success: function (user) {
      alert("Account Created!");
      Parse.User.logIn(username, password, {
        success: function (user) {
          window.location.assign("../home/index.html");
        },
        error: function (user, error) {
          alert("Could not login: " + error.message);
        }
      });
    },
    error: function (user, error) {
      alert("Error In Account Creation: " + error.message);
    }
  });
}
