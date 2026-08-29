// The Fed Ledger's word-level redline, in its own module so a test can drive the SHIPPING function.
//
// It lived inline in App.jsx, where nothing could reach it without a browser — which is how it went
// out with a defect visible on the public page: the June/July 2026 redline rendered
//
//     The Committee will deliver price stability.stability.
//
// with the first struck claret and the second underlined teal. The same word, reported as both a
// deletion and an insertion.
//
// THE CAUSE, and it is a one-character distinction. A token is a word plus its TRAILING whitespace,
// which is right for RENDERING — the space travels with its word, so a replacement can never end up
// jammed against what it replaced, and paragraph breaks survive inside the tokens. It was silently
// also being used for EQUALITY, and there the whitespace is noise: "stability." at the very end of
// the June statement and "stability.\n\n" mid-way through July's are the same word, and the LCS
// called them different because one is followed by a paragraph break and the other by nothing.
//
// So the two jobs are now separated and that separation is the whole fix: COMPARE on the bare word,
// RENDER the token with its spacing. Any diff whose tokens carry formatting has this bug latent in
// it the moment the same word appears at a paragraph boundary in one text and not the other.
const tokenize = s => String(s || "").match(/\S+\s*/g) || [];
const bare = t => t.replace(/\s+$/, "");

// Word-level LCS diff. Statements are a few hundred tokens, so O(m·k) is trivial.
// Returns [["eq"|"del"|"ins", token], …] where token still carries its whitespace, for rendering.
export function fedWordDiff(oldS, newS) {
  const o = tokenize(oldS), n = tokenize(newS), m = o.length, k = n.length;
  // Compared once, up front — trimming inside the O(m·k) loop would do it millions of times.
  const ob = o.map(bare), nb = n.map(bare);
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(k + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = k - 1; j >= 0; j--) dp[i][j] = ob[i] === nb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  // On a match the NEW token is emitted, so the new statement's spacing is what the reader sees —
  // the redline is a picture of the current statement with the old one struck through it.
  while (i < m && j < k) {
    if (ob[i] === nb[j]) { out.push(["eq", n[j]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(["del", o[i]]); i++; }
    else { out.push(["ins", n[j]]); j++; }
  }
  while (i < m) out.push(["del", o[i++]]);
  while (j < k) out.push(["ins", n[j++]]);
  return out;
}
