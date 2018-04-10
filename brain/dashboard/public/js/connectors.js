function toggleConnectorDetail(connectorId) {
  // Get Connector details
  $.ajax({
    type: "GET",
    baseUrl: base_url,
    url: `/connectors/${connectorId}`,
    dataType: "json",
    success: (json) => {
      $(`#detail-${connectorId} .token`).text(json.connector.token);
      $(`#detail-${connectorId}`).on('show.bs.collapse', () => {
        $(`#connector-${connectorId} .displayer`)
          .find('[data-fa-i2svg]')
          .toggleClass("fa-caret-down")
          .toggleClass("fa-caret-up");
        $(`#detail-${connectorId}`).off('hide.bs.collapse');
        $(`#detail-${connectorId}`).off('show.bs.collapse');
      });
      $(`#detail-${connectorId}`).on('hide.bs.collapse', () => {
        $(`#connector-${connectorId} .displayer`)
          .find('[data-fa-i2svg]')
          .toggleClass("fa-caret-up")
          .toggleClass("fa-caret-down");
        $(`#detail-${connectorId}`).off('hide.bs.collapse');
        $(`#detail-${connectorId}`).off('show.bs.collapse');
      });
      $(`#detail-${connectorId}`).collapse('toggle');
    },
    error: (error) => {
      notifyUser({
        title: "Error",
        message: "Could not retrieve connector details.",
        delay: 2,
        type: "error"
      })
    }
  });
}

function refreshToken(button) {
  $(button).find('[data-fa-i2svg]').toggleClass('fa-spin');

  setTimeout(() => {
    // Refresh Connector token
    $.ajax({
      type: "POST",
      baseUrl: base_url,
      url: `/connectors/${$(button).data('connector')}/token`,
      dataType: "json",
      success: (json) => {
        $(button).find('[data-fa-i2svg]').toggleClass('fa-spin');
        $(`#detail-${$(button).data('connector')} .token`).text(json.connector.token);
      },
      error: (error) => {
        $(button).find('[data-fa-i2svg]').toggleClass('fa-spin');
        notifyUser({
          title: "Error",
          message: "Could not refresh connector token.",
          delay: 2,
          type: "error"
        })
      }
    });
  }, 1000);
}
