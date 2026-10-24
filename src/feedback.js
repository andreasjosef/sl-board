// Lesson 2 – small helpers for feedback.
// The *state* lives in JavaScript (data-state). CSS decides what each state looks like.

// Waits ms milliseconds. We use it to pretend the network is slow (?latency=1500).
// You don't need to know how it works inside – just use it with await.
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
