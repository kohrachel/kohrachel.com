const URL_IN_TEXT =
  /https?:\/\/[^\s<>"'“”‘’，。！？、；：「」『』（）【】《》]+/i;
const BARE_URL = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#]\S*)?$/i;
const TRAILING_PUNCTUATION = /^[.,;:!?)\]}'"]$/;

/** Finds the first link in pasted text, such as a bare URL or app share text. */
export function extractUrl(text: string): string | null {
  const trimmed = text.trim();
  const match = trimmed.match(URL_IN_TEXT);
  const candidate = match
    ? match[0]
    : BARE_URL.test(trimmed)
      ? `https://${trimmed}`
      : null;
  if (!candidate) return null;

  const url = stripTrailingPunctuation(candidate);
  return URL.canParse(url) ? url : null;
}

function stripTrailingPunctuation(url: string) {
  let result = url;
  while (TRAILING_PUNCTUATION.test(result.slice(-1))) {
    // Keep a closing parenthesis that belongs to the URL, as in Wikipedia links.
    if (result.endsWith(")") && count(result, "(") >= count(result, ")")) break;
    result = result.slice(0, -1);
  }
  return result;
}

function count(text: string, char: string) {
  return text.split(char).length - 1;
}
