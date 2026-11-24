// Old browsers cannot render the modern CSS this prototype uses. Show a clear message instead of a broken page.
(function () {
  // Firefox 113 to 127 passed the old probe but has no @property, so registered custom properties
  // silently fell back and parts of the page lost their colours. Check what the styles actually need.
  var ok = window.CSS && CSS.supports && CSS.supports("color", "color-mix(in srgb, red, blue)")
    && CSS.supports("inset", "0") && CSS.supports("selector(:has(*))") && CSS.supports("height", "1dvh")
    && typeof CSS.registerProperty === "function" && "IntersectionObserver" in window;
  if (!ok) {
    document.addEventListener("DOMContentLoaded", function () {
      var d = document.createElement("div");
      d.setAttribute("role", "alert");
      d.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:99999;background:#FFE9CC;color:#8A4B08;font:600 15px/1.4 sans-serif;padding:14px 18px;text-align:center";
      d.textContent = "Your browser is out of date, so this prototype may look broken. Please use the latest Chrome, Edge, Safari 16.4+ or Firefox.";
      document.body.appendChild(d);
    });
  }
})();
