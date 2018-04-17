$("#modify-username").submit((event) => {
  event.preventDefault();
  let username = $("#new-username").val();
  let usernameRegex = /^[0-9a-zA-Z\u00E0-\u00FC -_]{3,30}$/;

  if (!usernameRegex.test(username)) {
    notifyUser({
      title: "Invalid username.",
      message: "",
      delay: 2,
      type: "error"
    });
  } else {
    $.ajax({
      method: "PUT",
      baseUrl: base_url,
      url: "/dashboard/settings/username",
      data: { username: username },
      dataType: "json",
      success: (json) => {
        notifyUser({
          title: "Username modified.",
          message: "",
          delay: 2,
          type: "success"
        });
      },
      error: (err) => {
        if (err.responseJSON) {
          notifyUser({
            title: "Can't update username.",
            message: err.responseJSON.message,
            type: "error",
            delay: 2
          })
        } else {
          notifyUser({
            title: "Can't update username.",
            message: "An error occured.   ",
            type: "error",
            delay: 2
          })
        }
      }
    })
  }
});

$("#modify-password").submit((event) => {
  event.preventDefault();
  notifyUser({
    title: "Not implemented.",
    message: "You can't modify your password yet.",
    delay: 2,
    type: "warning"
  });
});
