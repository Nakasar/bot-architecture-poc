$('#chat-form').submit((event) => {
  event.preventDefault();
  let message = $("#chat").val().trim();
  if (message.length <= 0) {
    return;
  }

  console.log("Message sent: " + message);

  $.ajax({
    type: "POST",
    url: "/nlp",
    data: { phrase: message },
    dataType: 'json',
    success: function(json) {
      console.log(json)
      $("#chat").val('');
      $("#bot-response #source").text(json.source)
      $("#bot-response #message").html(formatText(json.message));
    },
    error: function(err) {
      $("#chat").val('');
      if (json = err.responseJSON) {
        $("#bot-response #source").text(json.source);
        $("#bot-response #message").html(formatText(json.message));
      } else {
        console.log(err)
      }
    }
  })
});

function formatText(text) {
  // Remove html tags.
  let formatted = text.replace(/<(.|\n)*?>/, "");
  formatted = formatted.replace(/( |\\n|[^a-zA-Z0-9\u00C0-\u017F])\*(.*?)\*( |[^a-zA-Z0-9\u00C0-\u017F])/g, "$1<strong>$2</strong>$3");
  formatted = formatted.replace(/\[b\](.*?)\[\/b\]/g, "<strong>$1</strong>");
  formatted = formatted.replace(/( |\\n|[^a-zA-Z0-9\u00C0-\u017F])\_(.*?)\_( |[^a-zA-Z0-9\u00C0-\u017F])/g, "$1<em>$2</em>$3");
  formatted = formatted.replace(/\[i\](.*?)\[\/i\]/g, "<em>$1</em>");
  return formatted;
};
