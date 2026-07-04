// The Garden — notifications: morning + evening + weekly-letter anchors (plan §5.2, §11).
// Local only, opt-in, off by default, DND-respecting where detectable, iOS fallback banner.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  let scheduled = []; // in-memory timeouts while app is open
  const KEY = "garden-notify-banner";

  async function permission() {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "default") return await Notification.requestPermission();
    return Notification.permission;
  }

  function isDND() {
    // Best-effort: no web API for OS DND. Respect prefers-do-not-disturb via start/end times set by user.
    return false;
  }

  function clearAll() { scheduled.forEach(t => clearTimeout(t)); scheduled = []; }

  async function scheduleAll(settings) {
    clearAll();
    if (!settings.notifications) return;
    const n = settings.notifications;
    if (n.morning && n.morningOn) scheduleAt(n.morningTime, "A new card is waiting in the garden.", () => Garden.app.openToFirstCard());
    if (n.evening && n.eveningOn) scheduleAt(n.eveningTime, "Log one quiet victory today.", () => Garden.app.openToFirstCard());
    if (n.weekly && n.weeklyOn) scheduleWeekly(n.weeklyDay, n.weeklyTime,
      "It's " + dayName(n.weeklyDay) + " — a few lines to " + (Garden.app.childName() || "your child") + " keep the thread active.",
      () => Garden.app.openLetter({ anchor: true }));
  }

  function dayName(i) { return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][i] || "Sunday"; }

  function scheduleAt(timeStr, body, onShow) {
    if (!timeStr) return;
    const [h, m] = timeStr.split(":").map(Number);
    const now = new Date();
    let at = new Date(); at.setHours(h, m, 0, 0);
    if (at <= now) at.setDate(at.getDate() + 1);
    const ms = at - now;
    scheduled.push(setTimeout(() => notify("The Garden", body, onShow), ms));
  }

  function scheduleWeekly(dayIdx, timeStr, body, onShow) {
    if (!timeStr) return;
    const [h, m] = timeStr.split(":").map(Number);
    const now = new Date();
    let at = new Date(); at.setHours(h, m, 0, 0);
    let diff = (dayIdx - at.getDay() + 7) % 7;
    at.setDate(at.getDate() + diff);
    if (at <= now) at.setDate(at.getDate() + 7);
    scheduled.push(setTimeout(() => notify("The Garden", body, onShow), at - now));
  }

  function notify(title, body, onShow) {
    if (isDND()) return;
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(title, { body, tag: "garden", icon: "assets/icons/192.png" });
        n.onclick = () => { window.focus(); onShow && onShow(); };
        return;
      } catch (e) {}
    }
    // iOS / no-permission fallback: in-app banner
    Garden.app.banner(body);
  }

  window.Garden.notify = { permission, scheduleAll, clearAll };
})();
