function skillToggle(skillButton) {
  let skill = $(skillButton).data('skill');
  let status = $(skillButton).data('active');

  if (skill) {
    $.ajax({
      type: "POST",
      baseUrl: 'http://localhost;8080',
      url: `/dashboard/skills/${skill}/${status ? "off" : "on"}`,
      dataType: 'json',
      success: function(json) {
        if (json.active) {
          $(skillButton).attr('data-active', true);
          $(skillButton).data('active', true);
          $(skillButton)
            .find('[data-fa-i2svg]')
            .toggleClass("fa-toggle-on")
            .toggleClass("fa-toggle-off")
            .toggleClass("text-success")
            .toggleClass("text-danger");
          $(skillButton).attr('title', 'Deactivate skill');
          $(skillButton).attr('aria-label', 'Deactivate skill');
        } else {
          $(skillButton).attr('data-active', false);
          $(skillButton).data('active', false);
          $(skillButton)
            .find('[data-fa-i2svg]')
            .toggleClass("fa-toggle-on")
            .toggleClass("fa-toggle-off")
            .toggleClass("text-success")
            .toggleClass("text-danger");
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
        url: `/dashboard/skills/${skill}/reload`,
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
