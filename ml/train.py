"""Train and evaluate the synthetic document-section classifier."""

from __future__ import annotations

import csv
import json
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report


ROOT = Path(__file__).resolve().parent
MODEL_OUTPUT = (
    ROOT.parent
    / "artifacts"
    / "api-server"
    / "src"
    / "routes"
    / "section-model.json"
)


def read_dataset(path: Path) -> tuple[list[str], list[str]]:
    with path.open(encoding="utf-8", newline="") as dataset:
        rows = list(csv.DictReader(dataset))
    if not rows:
        raise ValueError(f"No examples found in {path}")
    return [row["text"] for row in rows], [row["label"] for row in rows]


def main() -> None:
    train_texts, train_labels = read_dataset(ROOT / "dataset" / "train.csv")
    test_texts, test_labels = read_dataset(ROOT / "dataset" / "test.csv")

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
        token_pattern=r"(?u)\b\w\w+\b",
    )
    train_vectors = vectorizer.fit_transform(train_texts)
    test_vectors = vectorizer.transform(test_texts)
    classifier = LogisticRegression(max_iter=1500, random_state=42)
    classifier.fit(train_vectors, train_labels)
    predictions = classifier.predict(test_vectors)
    report = classification_report(
        test_labels,
        predictions,
        labels=classifier.classes_,
        zero_division=0,
        output_dict=True,
    )

    feature_names = vectorizer.get_feature_names_out()
    vocabulary = vectorizer.vocabulary_
    ordered_features = sorted(vocabulary, key=vocabulary.get)
    model = {
        "version": 1,
        "classes": classifier.classes_.tolist(),
        "vocabulary": {
            feature: int(vocabulary[feature]) for feature in ordered_features
        },
        "idf": vectorizer.idf_.tolist(),
        "coefficients": classifier.coef_.tolist(),
        "intercepts": classifier.intercept_.tolist(),
        "trainingExamples": len(train_texts),
        "testExamples": len(test_texts),
        "metrics": {
            label: {
                "precision": round(report[label]["precision"], 4),
                "recall": round(report[label]["recall"], 4),
                "f1": round(report[label]["f1-score"], 4),
                "support": int(report[label]["support"]),
            }
            for label in classifier.classes_
        },
        "macroAverage": {
            "precision": round(report["macro avg"]["precision"], 4),
            "recall": round(report["macro avg"]["recall"], 4),
            "f1": round(report["macro avg"]["f1-score"], 4),
        },
        "featureCount": len(feature_names),
    }
    MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    MODEL_OUTPUT.write_text(json.dumps(model, ensure_ascii=False), encoding="utf-8")
    print(
        json.dumps(
            {
                "model": str(MODEL_OUTPUT.relative_to(ROOT.parent)),
                "trainingExamples": len(train_texts),
                "testExamples": len(test_texts),
                "featureCount": len(feature_names),
                "metrics": model["metrics"],
                "macroAverage": model["macroAverage"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
