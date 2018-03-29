let editor;

function skillToggle(skillButton) {
  let skill = $(skillButton).data('skill');
  let status = $(skillButton).data('active');

  if (skill) {
    $.ajax({
      type: "POST",
      baseUrl: 'http://localhost;8080',
      url: `/skills/${skill}/${status ? "off" : "on"}`,
      dataType: 'json',
      success: function(json) {
        console.log(json);
        if (json.active) {
          $(skillButton).attr('data-active', true);
          $(skillButton).data('active', true);
          $(skillButton)
            .find('[data-fa-i2svg]')
            .toggleClass("fa-toggle-on")
            .toggleClass("fa-toggle-off");
          $(skillButton)
            .toggleClass("text-success")
            .toggleClass("text-danger");
          $(skillButton).attr('title', 'Deactivate skill');
          $(skillButton).attr('aria-label', 'Deactivate skill');
        } else {
          $(skillButton).attr('data-active', false);
          $(skillButton).data('active', false);
          $(skillButton)
            .find('[data-fa-i2svg]')
            .toggleClass("fa-toggle-off")
            .toggleClass("fa-toggle-on");
          $(skillButton)
            .toggleClass("text-danger")
            .toggleClass("text-success");
          $(skillButton).attr('title', 'Activate skill');
          $(skillButton).attr('aria-label', 'Activate skill');
        }
      },
      error: function(err) {
        console.log(err)
      }
    });
  }
};

function toggleSkillDetail(skillName) {
  $(`#detail-${skillName}`).on('show.bs.collapse', () => {
    $(`#skill-${skillName} .displayer`)
      .find('[data-fa-i2svg]')
      .toggleClass("fa-caret-down")
      .toggleClass("fa-caret-up");
    $(`#detail-${skillName}`).off('hide.bs.collapse');
    $(`#detail-${skillName}`).off('show.bs.collapse');
  });
  $(`#detail-${skillName}`).on('hide.bs.collapse', () => {
    $(`#skill-${skillName} .displayer`)
      .find('[data-fa-i2svg]')
      .toggleClass("fa-caret-up")
      .toggleClass("fa-caret-down");
    $(`#detail-${skillName}`).off('hide.bs.collapse');
    $(`#detail-${skillName}`).off('show.bs.collapse');
  });

  $(`#detail-${skillName}`).collapse('toggle');
}

function reloadSkill(skillButton) {
  let skill = $(skillButton).data('skill');

  if (skill) {
    $(skillButton).find('[data-fa-i2svg]').toggleClass('fa-spin');

    setTimeout(() => {
      $.ajax({
        type: "POST",
        baseUrl: 'http://localhost;8080',
        url: `/skills/${skill}/reload`,
        dataType: 'json',
        success: function(json) {
          console.log(json);
          if (json.success) {
            notifyUser({
              title: `Skill ${skill} reloaded!`,
              message: "",
              type: "info",
              seconds: 3
            });
          }
          $(skillButton).find('[data-fa-i2svg]').toggleClass('fa-spin');
        },
        error: function(err) {
          console.log(err)
          $(skillButton).find('[data-fa-i2svg]').toggleClass('fa-spin');
        }
      });
    }, 2000);
  }
}

function editSkill(skillButton) {
  let skill = $(skillButton).data('skill');

  let notificationId = notifyUser({
    title: "Retrieving code...",
    message: `We are retrieving code of ${skill}, please wait.`,
    type: "info",
    delay: -1
  });

  if (skill) {
    $.ajax({
      type: "GET",
      baseUrl: 'http://localhost;8080',
      url: `/skills/${skill}/edit`,
      dataType: 'json',
      success: function(json) {
        if (json.success) {
          $("#code-modal h5").text(`${skill} / skill.js`);
          $("#code-modal .save").attr('data-skill', skill);

          if (editor) {
            editor.destroy();
          }
          editor = ace.edit("editor");
          editor.setTheme("ace/theme/monokai");
          editor.session.setMode("ace/mode/javascript")
          editor.setValue(json.code, -1);
          editor.session.setValue(json.code, -1);
          editor.clearSelection();
          editor.resize();
          setTimeout(() => {
            dismissNotification(notificationId);
            $("#code-modal").modal('show');
          }, 2000)
        }
      },
      error: function(err) {
        dismissNotification(notificationId);
        console.log(err)
      }
    });
  }
}

function saveSkillCode(skillButton) {
  let skill = $(skillButton).data('skill');
  if (editor) {
    let code = editor.getValue();

    $("#code-modal").modal('hide');
    let notificationId = notifyUser({
      title: `Please wait`,
      message: `We are saving modifications for skill ${skill}.`,
      type: "warning",
      delay: -1
    });

    if (skill) {
      $.ajax({
        type: "PUT",
        baseUrl: 'http://localhost;8080',
        url: `/skills/${skill}/edit`,
        data: { code: code },
        dataType: 'json',
        success: function(json) {
          dismissNotification(notificationId);
          console.log(json);
          if (json.success) {
            notifyUser({
              title: `Modification saved!`,
              message: `The Skill ${skill} was updated and reloaded.`,
              type: "success",
              delay: 5
            });
          } else {
            notifyUser({
              title: `Error`,
              message: `We could not save and/or reload the skill.`,
              type: "error",
              delay: -1
            });
          }
        },
        error: function(err) {
          dismissNotification(notificationId);
          notifyUser({
            title: `Unkown Error`,
            message: `The server could not be reached, or responded with a internal error.`,
            type: "error",
            delay: -1
          });
        }
      });
    }
  }
}
