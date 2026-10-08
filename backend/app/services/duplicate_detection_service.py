import math
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

from app.models.scheme import Scheme
from app.services.nlp_service import NLPAnalysisService
from app.utils.logger import logger


class LocalTfidfVectorizer:
    """
    Pure Python TF-IDF Vectorizer with n-gram support and smoothed IDF.
    Operates without compiled binary C-extensions, ensuring 100% portability,
    zero-dependency execution, and immunity to OS DLL-blocking policies.
    """

    def __init__(self, ngram_range: Tuple[int, int] = (1, 2)):
        self.ngram_range = ngram_range
        self.vocabulary_: Dict[str, int] = {}
        self.idf_: Dict[str, float] = {}

    def _extract_ngrams(self, tokens: List[str]) -> List[str]:
        ngrams: List[str] = []
        min_n, max_n = self.ngram_range
        n_tokens = len(tokens)
        for n in range(min_n, max_n + 1):
            for i in range(n_tokens - n + 1):
                ngrams.append(" ".join(tokens[i : i + n]))
        return ngrams

    def fit_transform(self, raw_documents: List[str]) -> List[Dict[int, float]]:
        """
        Fits corpus statistics and returns unit-normalized sparse TF-IDF vectors.
        """
        doc_tokens = [doc.split() for doc in raw_documents]
        doc_ngrams = [self._extract_ngrams(tokens) for tokens in doc_tokens]

        # Document frequency count
        df: Counter = Counter()
        for ngrams in doc_ngrams:
            unique_terms = set(ngrams)
            for term in unique_terms:
                df[term] += 1

        # Vocabulary indexing
        self.vocabulary_ = {term: idx for idx, term in enumerate(sorted(df.keys()))}

        # Smoothed IDF: ln((1 + N) / (1 + df)) + 1.0
        n_docs = len(raw_documents)
        self.idf_ = {
            term: math.log((1.0 + n_docs) / (1.0 + count)) + 1.0
            for term, count in df.items()
        }

        # Sparse TF-IDF representations
        vectors: List[Dict[int, float]] = []
        for ngrams in doc_ngrams:
            term_counts = Counter(ngrams)
            vec: Dict[int, float] = {}
            norm_sq = 0.0
            for term, count in term_counts.items():
                if term in self.vocabulary_:
                    t_idx = self.vocabulary_[term]
                    tfidf_val = count * self.idf_[term]
                    vec[t_idx] = tfidf_val
                    norm_sq += tfidf_val * tfidf_val

            # L2 unit normalization
            norm = math.sqrt(norm_sq)
            if norm > 0.0:
                for t_idx in vec:
                    vec[t_idx] /= norm
            vectors.append(vec)

        return vectors

    @staticmethod
    def cosine_similarity(u: Dict[int, float], v: Dict[int, float]) -> float:
        """
        Computes cosine similarity between two unit-normalized sparse vectors.
        Equivalent to the dot product of the unit vectors.
        """
        if not u or not v:
            return 0.0
        # Iterate over smaller vector for performance
        if len(u) > len(v):
            u, v = v, u
        dot_product = 0.0
        for idx, val in u.items():
            if idx in v:
                dot_product += val * v[idx]
        return max(0.0, min(1.0, dot_product))


class DuplicateDetectionService:
    """
    Local TF-IDF and Cosine Similarity service for identifying duplicate, cloned,
    or closely related government scheme records without paid external APIs.
    """

    # Configurable similarity threshold boundaries
    HIGH_SIMILARITY_THRESHOLD: float = 0.70
    MODERATE_SIMILARITY_THRESHOLD: float = 0.35

    def __init__(
        self,
        high_threshold: float = HIGH_SIMILARITY_THRESHOLD,
        moderate_threshold: float = MODERATE_SIMILARITY_THRESHOLD,
    ):
        self.high_threshold = high_threshold
        self.moderate_threshold = moderate_threshold
        self.nlp = NLPAnalysisService()
        logger.info(
            f"Initialized DuplicateDetectionService (high_thresh={self.high_threshold}, mod_thresh={self.moderate_threshold})"
        )

    def _prepare_document_text(self, name: str, description: Optional[str] = None) -> str:
        """
        Constructs a normalized composite text prioritizing the scheme name
        (repeated 3x to give appropriate lexical weight to the scheme title).
        """
        clean_name = self.nlp.normalize_text(name)
        clean_desc = self.nlp.normalize_text(description or "")
        return f"{clean_name} {clean_name} {clean_name} {clean_desc}".strip()

    def compare_schemes(
        self,
        submitted_name: str,
        submitted_description: Optional[str],
        candidate_schemes: List[Scheme],
    ) -> Dict[str, Any]:
        """
        Compares submitted scheme text against a collection of stored Scheme records
        using TF-IDF vectorization and cosine similarity.
        """
        query_doc = self._prepare_document_text(submitted_name, submitted_description)

        if not query_doc or not candidate_schemes:
            return {
                "duplicate_match": False,
                "matched_scheme_id": None,
                "matched_scheme_name": None,
                "similarity_score": 0.0,
                "similarity_tier": "none",
                "reason": "No existing scheme records available for comparison."
                if not candidate_schemes
                else "Insufficient submitted text to compute similarity.",
                "top_matches": [],
            }

        candidate_docs: List[str] = []
        candidate_names: List[str] = []
        for scheme in candidate_schemes:
            # Combine name, description, benefits, and eligibility
            combined_desc = f"{scheme.description or ''} {scheme.benefits or ''} {scheme.eligibility or ''}"
            doc = self._prepare_document_text(scheme.name, combined_desc)
            candidate_docs.append(doc)
            candidate_names.append(self.nlp.normalize_text(scheme.name))

        query_name = self.nlp.normalize_text(submitted_name)
        doc_corpus = [query_doc] + candidate_docs
        name_corpus = [query_name] + candidate_names

        try:
            doc_vec = LocalTfidfVectorizer(ngram_range=(1, 2))
            doc_vectors = doc_vec.fit_transform(doc_corpus)
            doc_scores = [
                doc_vec.cosine_similarity(doc_vectors[0], c_vec)
                for c_vec in doc_vectors[1:]
            ]

            name_vec = LocalTfidfVectorizer(ngram_range=(1, 2))
            name_vectors = name_vec.fit_transform(name_corpus)
            name_scores = [
                name_vec.cosine_similarity(name_vectors[0], c_vec)
                for c_vec in name_vectors[1:]
            ]

            # Combine title and document similarity: prioritize strong title matches
            scores = [
                max(name_scores[i], 0.6 * name_scores[i] + 0.4 * doc_scores[i], doc_scores[i])
                for i in range(len(candidate_schemes))
            ]
        except Exception as exc:
            logger.error(f"Error during TF-IDF vectorization: {exc}")
            return {
                "duplicate_match": False,
                "matched_scheme_id": None,
                "matched_scheme_name": None,
                "similarity_score": 0.0,
                "similarity_tier": "none",
                "reason": "Unable to calculate similarity score due to processing error.",
                "top_matches": [],
            }

        # Rank candidate matches
        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        top_matches: List[Dict[str, Any]] = []

        for idx in ranked_indices[:5]:
            score = float(scores[idx])
            matched_scheme = candidate_schemes[idx]
            top_matches.append(
                {
                    "scheme_id": matched_scheme.id,
                    "scheme_name": matched_scheme.name,
                    "department": matched_scheme.department,
                    "similarity_score": round(score, 4),
                }
            )

        best_score = float(scores[ranked_indices[0]]) if len(ranked_indices) > 0 else 0.0
        best_scheme = candidate_schemes[ranked_indices[0]] if len(ranked_indices) > 0 else None

        # Determine similarity classification tier and explanation
        if best_score >= self.high_threshold and best_scheme:
            similarity_tier = "high"
            duplicate_match = True
            reason = (
                f"High similarity ({round(best_score * 100, 1)}%) detected with official catalog scheme "
                f"'{best_scheme.name}' (ID: {best_scheme.id}). May be a duplicate claim or direct variant."
            )
        elif best_score >= self.moderate_threshold and best_scheme:
            similarity_tier = "moderate"
            duplicate_match = False
            reason = (
                f"Moderate thematic overlap ({round(best_score * 100, 1)}%) detected with scheme "
                f"'{best_scheme.name}'. Share common terminology or category."
            )
        else:
            similarity_tier = "low"
            duplicate_match = False
            reason = "No closely matching existing scheme was found in the catalog."

        return {
            "duplicate_match": duplicate_match,
            "matched_scheme_id": best_scheme.id if (best_scheme and best_score >= self.moderate_threshold) else None,
            "matched_scheme_name": best_scheme.name if (best_scheme and best_score >= self.moderate_threshold) else None,
            "similarity_score": round(best_score, 4),
            "similarity_tier": similarity_tier,
            "reason": reason,
            "top_matches": top_matches,
        }
