function notifyUser({ title = "Notification", message = "Here is a notification for you, user!", type = "info" } = {}) {
  let alertClass;
  switch (type) {
    case "info":
      alertClass = "alert-info";
      break;
    case "warning":
      alertClass = "alert-warning";
      break;
    case "error":
      alertClass = "alert-danger";
      break;
    case "light":
    default:
      alertClass = "alert-light";
      break;
  }
  let notification = `
    <div class="alert ${alertClass} alert-dismissible fade show">
      <h5 class="alert-heading">${title}</h4>
      <p class="mb-0">${message}</p>
      <button class="close" type="button" aria-label="Close" data-dismiss="alert">
        <span aria-hidden="true")>&times;</span>
      </button>
    </div>
  `.trim();
  $('#notifications').append(notification);
};
