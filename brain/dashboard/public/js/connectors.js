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

function toggleConnector(button) {
  let connector = $(button).data('connector');
  let status = $(button).data('active');

  // Toggle Connector status
  $.ajax({
    type: "POST",
    baseUrl: base_url,
    url: `/connectors/${connector}/toggle/${status ? "off" : "on"}`,
    dataType: "json",
    success: (json) => {
      if (json.connector.active) {
        $(button).attr('data-active', true);
        $(button).data('active', true);
        $(button)
          .find('[data-fa-i2svg]')
          .toggleClass("fa-toggle-on")
          .toggleClass("fa-toggle-off");
        $(button)
          .toggleClass("text-success")
          .toggleClass("text-danger");
        $(button).attr('title', 'Deactivate connector');
        $(button).attr('aria-label', 'Deactivate connector');
      } else {
        $(button).attr('data-active', false);
        $(button).data('active', false);
        $(button)
          .find('[data-fa-i2svg]')
          .toggleClass("fa-toggle-off")
          .toggleClass("fa-toggle-on");
        $(button)
          .toggleClass("text-danger")
          .toggleClass("text-success");
        $(button).attr('title', 'Activate connector');
        $(button).attr('aria-label', 'Activate connector');
      }
    },
    error: (error) => {
      notifyUser({
        title: "Error",
        message: "Could not toggle connector status.",
        delay: 2,
        type: "error"
      })
    }
  });
}

function deleteConnector(button) {
  // Delete Connector
  $.ajax({
    type: "DELETE",
    baseUrl: base_url,
    url: `/connectors/${$(button).data('connector')}`,
    dataType: "json",
    success: (json) => {
      $(`#connector-${$(button).data('connector')}`).remove();
      notifyUser({
        title: "Connector revoked",
        message: "We will ignore all request from this source.",
        delay: 2,
        type: "success"
      })
    },
    error: (error) => {
      notifyUser({
        title: "Error",
        message: "Could not remove connector.",
        delay: 2,
        type: "error"
      });
    }
  });
}
