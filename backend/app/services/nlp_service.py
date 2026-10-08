import html
import re
import unicodedata
from typing import Any, Dict, List, Set

from app.utils.logger import logger

# Curated lightweight English stop words for scheme and scam text analysis
COMMON_STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do",
    "does", "doing", "down", "during", "each", "few", "for", "from", "further",
    "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself",
    "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of",
    "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
    "out", "over", "own", "same", "she", "should", "so", "some", "such", "than",
    "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these",
    "they", "this", "those", "through", "to", "too", "under", "until", "up", "very",
    "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves",
}


class NLPAnalysisService:
    """
    Local NLP and text normalization service.
    Provides deterministic, zero-cost preprocessing for scheme similarity,
    entity identification, and pattern matching.
    """

    def __init__(self):
        logger.info("Initialized local NLPAnalysisService pipeline.")

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Cleans and normalizes raw text input:
        1. Handles None/empty input gracefully.
        2. Unescapes HTML entities.
        3. Applies Unicode NFKD normalization to decompose special accents/symbols.
        4. Strips URLs and HTML tags.
        5. Converts to lowercase.
        6. Strips punctuation while keeping alphanumeric tokens and spaces.
        7. Collapses redundant whitespace.
        """
        if not text:
            return ""

        # Unescape HTML entities (e.g. &amp;, &quot;)
        cleaned = html.unescape(text)

        # Unicode normalization (safe ASCII conversion)
        cleaned = unicodedata.normalize("NFKD", cleaned)
        cleaned = cleaned.encode("ascii", "ignore").decode("utf-8", "ignore")

        # Strip URL patterns from text content to prevent noise in NLP
        cleaned = re.sub(r"https?://\S+|www\.\S+", " ", cleaned)

        # Strip HTML tags
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)

        # Lowercase
        cleaned = cleaned.lower()

        # Replace non-alphanumeric characters with spaces
        cleaned = re.sub(r"[^a-z0-9\s]", " ", cleaned)

        # Expand common welfare scheme acronyms for robust token matching
        cleaned = re.sub(r"\bpm\b", "pradhan mantri", cleaned)

        # Collapse whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        return cleaned

    @staticmethod
    def tokenize(text: str, remove_stopwords: bool = True) -> List[str]:
        """
        Tokenizes text into individual word tokens with optional stop-word filtering.
        Filters out tokens shorter than 2 characters.
        """
        normalized = NLPAnalysisService.normalize_text(text)
        if not normalized:
            return []

        tokens = normalized.split()

        if remove_stopwords:
            tokens = [t for t in tokens if t not in COMMON_STOPWORDS and len(t) > 1]
        else:
            tokens = [t for t in tokens if len(t) > 1]

        return tokens

    @staticmethod
    def extract_ngrams(tokens: List[str], n: int = 2) -> List[str]:
        """
        Extracts contiguous n-grams from a list of tokens for phrase matching.
        """
        if len(tokens) < n:
            return []
        return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]

    @staticmethod
    def extract_keywords(text: str, top_k: int = 10) -> List[str]:
        """
        Extracts frequency-ranked non-stopword keywords from text.
        """
        tokens = NLPAnalysisService.tokenize(text, remove_stopwords=True)
        if not tokens:
            return []

        freq: Dict[str, int] = {}
        for token in tokens:
            freq[token] = freq.get(token, 0) + 1

        sorted_tokens = sorted(freq.items(), key=lambda item: item[1], reverse=True)
        return [word for word, _ in sorted_tokens[:top_k]]
