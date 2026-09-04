"""Resume data structures and deterministic job-description analysis."""

from dataclasses import asdict, dataclass, field
import re
from collections import Counter
from typing import Any


STOPWORDS = {
    "about", "after", "again", "against", "all", "also", "and", "any", "are",
    "because", "been", "before", "being", "between", "both", "but", "can",
    "could", "each", "for", "from", "further", "have", "having", "into", "its",
    "just", "more", "most", "must", "not", "only", "other", "our", "out", "over",
    "same", "should", "some", "such", "than", "that", "their", "them", "then",
    "there", "these", "they", "this", "those", "through", "under", "until", "very",
    "was", "were", "what", "when", "where", "which", "while", "with", "would",
    "your", "years", "year", "experience", "skills", "skill", "role", "work", "working",
    "team", "teams", "job", "company", "candidate", "required", "including", "using",
}

ALIASES = {
    "js": "javascript", "ts": "typescript", "py": "python", "postgres": "postgresql",
    "k8s": "kubernetes", "aws cloud": "aws", "google cloud platform": "gcp",
    "continuous integration": "ci/cd", "continuous delivery": "ci/cd", "user experience": "ux",
    "user interface": "ui", "search engine optimization": "seo", "machine learning": "ml",
}


@dataclass
class Resume:
    """A normalized resume that can be serialized or converted to searchable text."""

    label: str = "Untitled resume"
    contact: dict[str, Any] = field(default_factory=dict)
    summary: str = ""
    experience: list[dict[str, Any]] = field(default_factory=list)
    education: list[dict[str, Any]] = field(default_factory=list)
    skills: list[str] = field(default_factory=list)
    projects: list[dict[str, Any]] = field(default_factory=list)

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "Resume":
        return cls(
            label=str(value.get("label", "Untitled resume")),
            contact=value.get("contact") or {},
            summary=str(value.get("summary", "")),
            experience=value.get("experience") or [],
            education=value.get("education") or [],
            skills=[str(skill) for skill in value.get("skills", [])],
            projects=value.get("projects") or [],
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_text(self) -> str:
        parts = [self.contact.get("name", ""), self.contact.get("role", ""), self.summary]
        for item in self.experience + self.projects + self.education:
            parts.extend(str(value) for value in item.values())
        parts.extend(self.skills)
        return "\n".join(part for part in parts if part)


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z][a-z0-9+#./-]*", text.lower())


def _normalize(text: str) -> str:
    normalized = re.sub(r"[^a-z0-9+#./ -]", " ", text.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()
    for source, target in sorted(ALIASES.items(), key=lambda pair: -len(pair[0])):
        normalized = re.sub(rf"\b{re.escape(source)}\b", target, normalized)
    return normalized


def _stem(word: str) -> str:
    for ending in ("ation", "ment", "ing", "ers", "ies", "ed", "es", "s"):
        if len(word) > len(ending) + 3 and word.endswith(ending):
            return word[:-len(ending)] if ending != "ies" else word[:-3] + "y"
    return word


def _keywords(text: str, limit: int = 28) -> list[dict[str, Any]]:
    normalized = _normalize(text)
    words = [word for word in _tokens(normalized) if len(word) > 2 and word not in STOPWORDS]
    counts = Counter(words)
    terms = [{"term": word, "frequency": count, "weight": 1.0} for word, count in counts.items()]
    phrases = Counter(" ".join(pair) for pair in zip(words, words[1:]) if all(part not in STOPWORDS for part in pair))
    terms.extend({"term": phrase, "frequency": count, "weight": 1.35} for phrase, count in phrases.items() if count > 1)
    terms.sort(key=lambda item: (-item["frequency"], item["term"]))
    return terms[:limit]


def _present(term: str, text: str) -> bool:
    normalized_text = _normalize(text)
    normalized_term = _normalize(term)
    if normalized_term in normalized_text:
        return True
    term_words = [_stem(word) for word in _tokens(normalized_term)]
    text_words = [_stem(word) for word in _tokens(normalized_text)]
    if len(term_words) == 1:
        return term_words[0] in text_words
    return any(text_words[index:index + len(term_words)] == term_words for index in range(len(text_words) - len(term_words) + 1))


def analyze_resume(resume_text: str, job_description: str) -> dict[str, Any]:
    """Compare resume text to a pasted JD and return an explainable match report."""

    keywords = _keywords(job_description)
    matched = [item for item in keywords if _present(item["term"], resume_text)]
    missing = [item for item in keywords if not _present(item["term"], resume_text)]
    total = len(keywords)
    total_weight = sum(item["weight"] for item in keywords)
    matched_weight = sum(item["weight"] for item in matched)
    score = round(matched_weight / total_weight * 100) if total_weight else 0
    return {
        "score": score,
        "matched": matched,
        "missing": missing,
        "totalKeywords": total,
    }


def analyze_ats(resume: Resume, job_description: str) -> dict[str, Any]:
    """Return explainable ATS checks and safe improvements for a structured resume."""

    resume_text = resume.to_text()
    keyword_report = analyze_resume(resume_text, job_description)
    checks = []
    points = []
    contact = resume.contact
    if contact.get("name") and contact.get("email"):
        checks.append({"name": "Contact details", "passed": True, "detail": "Name and email are present."})
    else:
        checks.append({"name": "Contact details", "passed": False, "detail": "Add your full name and a professional email."})
        points.append("Add your full name and a professional email address to the Contact section.")
    if resume.summary.strip():
        checks.append({"name": "Professional summary", "passed": True, "detail": "A summary is present."})
    else:
        checks.append({"name": "Professional summary", "passed": False, "detail": "A short targeted summary is recommended."})
        points.append("Write a 2-3 sentence summary that names your target role and strongest relevant result.")
    if resume.experience:
        checks.append({"name": "Work experience", "passed": True, "detail": f"{len(resume.experience)} experience section(s) found."})
    else:
        checks.append({"name": "Work experience", "passed": False, "detail": "Add relevant experience or project evidence."})
        points.append("Add relevant experience or project evidence with measurable outcomes.")
    if resume.skills:
        checks.append({"name": "Skills section", "passed": True, "detail": f"{len(resume.skills)} skill(s) listed."})
    else:
        checks.append({"name": "Skills section", "passed": False, "detail": "Add a focused skills list."})
        points.append("Add a focused Skills section using tools and technologies you can demonstrate.")
    bullet_text = " ".join(str(item.get("bullets", "")) for item in resume.experience)
    action_words = {"built", "created", "delivered", "designed", "developed", "improved", "increased", "led", "launched", "reduced", "managed", "optimized"}
    has_action = any(word in _tokens(bullet_text) for word in action_words)
    checks.append({"name": "Action-oriented bullets", "passed": has_action, "detail": "Bullets use strong action language." if has_action else "Lead bullets with an action verb and outcome."})
    if not has_action:
        points.append("Rewrite experience bullets to start with an action verb and end with a result or metric where possible.")
    if keyword_report["missing"]:
        terms = ", ".join(item["term"] for item in keyword_report["missing"][:8])
        points.append(f"Review these missing JD terms and add only the ones that truthfully describe your experience: {terms}.")
    passed = sum(1 for check in checks if check["passed"])
    format_score = round(passed / len(checks) * 100)
    ats_score = round(keyword_report["score"] * 0.65 + format_score * 0.35)
    return {"score": ats_score, "keywordScore": keyword_report["score"], "formatScore": format_score, "checks": checks, "points": points, "missingKeywords": [item["term"] for item in keyword_report["missing"][:12]]}