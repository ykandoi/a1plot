// Safely serialize a JSON-LD object for embedding inside a <script> tag via
// dangerouslySetInnerHTML. JSON.stringify does NOT escape <, so a DB-sourced
// field containing </script> (e.g. a malicious listing title) would close the
// script element early and allow HTML/script injection (stored XSS). Escaping
// <, >, & and the U+2028/U+2029 line separators keeps the payload valid JSON
// while making script-breakout impossible.
export function jsonLdHtml(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
