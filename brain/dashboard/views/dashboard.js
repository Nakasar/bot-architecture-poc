$('#chat-form').submit((event) => {
  event.preventDefault();
  let message = $("#chat").val().trim();
  if (message.length <= 0) {
    return;
  }

  if (message.startsWith("!")) {
    // Send to commad endpoint.
    console.log("Message sent to Command: " + message.substring(1));

    $.ajax({
      type: "POST",
      url: "/command",
      data: { command: message.substring(1) },
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
    });
  } else {
    // Send to NLP endpoint.
    console.log("Message sent to NLP: " + message);

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
    });
  }
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
