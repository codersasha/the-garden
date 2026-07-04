// The Garden — PIN hashing via Web Crypto PBKDF2 (plan §8.3). Never store the raw PIN.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  const SUBTLE = (window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;
  const ITER = 100000;

  function bytesToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  function hexToBytes(hex) {
    const a = new Uint8Array(hex.length / 2);
    for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
    return a;
  }
  function randomSaltHex() {
    const a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return bytesToHex(a);
  }

  async function isAvailable() { return !!SUBTLE; }

  async function hashPin(pin, saltHex) {
    if (!SUBTLE) {
      // Non-crypto fallback (e.g. very old browser): still don't store raw. FNV-1a + salt.
      let h = 2166136261;
      const s = (saltHex || "") + ":" + pin;
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return { hash: (h >>> 0).toString(16), salt: saltHex, weak: true };
    }
    const salt = hexToBytes(saltHex);
    const key = await SUBTLE.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
    const bits = await SUBTLE.deriveBits({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, key, 256);
    return { hash: bytesToHex(bits), salt: saltHex, weak: false };
  }

  async function makeHash(pin) {
    const salt = randomSaltHex();
    return hashPin(pin, salt);
  }

  async function verify(pin, stored) {
    if (!stored || !stored.salt) return false;
    const attempt = await hashPin(pin, stored.salt);
    return attempt.hash === stored.hash;
  }

  window.Garden.crypto = { isAvailable, makeHash, hashPin, verify };
})();
