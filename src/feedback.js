// Lesson 2 – small helpers for feedback.
// The *state* lives in JavaScript (data-state). CSS decides what each state looks like.

// Waits ms milliseconds. We use it to pretend the network is slow (?latency=1500).
// You don't need to know how it works inside – just use it with await.
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Step 5 – a shake that says "no". element.animate() runs keyframes from JavaScript,
// and it can be started again as often as we like.
export function shake(el) {
  if (prefersReducedMotion()) return;

  const keyframes = [
    { transform: "translateX(0)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(-4px)" },
    { transform: "translateX(4px)" },
    { transform: "translateX(0)" },
  ];
  el.animate(keyframes, { duration: 400, easing: "ease-in-out" });
}

// Step 6 – View Transitions: the browser takes a picture of the page before and
// after update(), and animates between them. No support (or reduced motion)?
// Then we just update – the app works either way.
export function withViewTransition(update) {
  if (document.startViewTransition === undefined || prefersReducedMotion()) {
    update();
  } else {
    document.startViewTransition(update);
  }
}

// Step 4 – feedback that isn't only visual.
// Screen readers read out text that appears in an aria-live element.
// We empty it first and fill it a moment later, so the same message can be read out twice.
export function announce(el, message) {
  el.textContent = "";
  setTimeout(() => {
    el.textContent = message;
  }, 100);
}
