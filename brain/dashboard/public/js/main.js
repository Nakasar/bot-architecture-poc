const base_url = process.env.BASE_URL || ((process.env.HOST || "localhost") + ":" + (process.env.PORT || "8080"));
const bot_token = "fjkaz5h65g48az8dAHJKZDe";

/**
 * Log out user from dashboard, clear session.
 */
function logout() {
  console.log("[INFO] Logging out user. Clearing session.");

  localStorage.setItem("user_token", null);
  Cookies.remove('user_token');

  location.reload();
};
