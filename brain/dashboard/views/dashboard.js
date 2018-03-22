console.log("Hey !");

$('#chat-form').submit((event) => {
  event.preventDefault();
  let message = $("#chat").val().trim();
  if (message.length <= 0) {
    return;
  }
  console.log(message)
  $.ajax({
    type: "POST",
    url: "/nlp",
    data: { phrase: message },
    dataType: 'json',
    success: function(json) {
      $("#chat").val('');
      console.log(json);
    },
    error: function(err) {
      $("#chat").val('');
      if (json = err.responseJSON) {
        console.log(json.message);
        $("#bot-response #source").text(json.source)
        $("#bot-response #message").text(json.message)
      } else {
        console.log(err)
      }
    }
  })
});
