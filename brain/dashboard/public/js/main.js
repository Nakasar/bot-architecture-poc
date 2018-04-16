const base_url = "/"
const bot_token = "83672d6fc46d3162cdc7204e4877e1f87b30d";

/**
 * Log out user from dashboard, clear session.
 */
function logout() {
  console.log("[INFO] Logging out user. Clearing session.");

  localStorage.setItem("user_token", null);
  Cookies.remove('user_token');

  location.reload();
};
