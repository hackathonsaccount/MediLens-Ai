import modelData from "./section-model.json";

type ClassifierLabel =
  | "administrative"
  | "explanatory_note"
  | "measurement"
  | "reference_range"
  | "test_information"
  | "unclassified";

type TrainedSectionModel = {
  classes: ClassifierLabel[];
  vocabulary: Record<string, number>;
  idf: number[];
  coefficients: number[][];
  intercepts: number[];
};

const model = modelData as TrainedSectionModel;

function tokenize(text: string) {
  return text.toLocaleLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [];
}

export function classifySectionText(text: string): ClassifierLabel {
  const tokens = tokenize(text);
  const counts = new Map<string, number>();
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    counts.set(token, (counts.get(token) ?? 0) + 1);
    if (index < tokens.length - 1) {
      const bigram = `${token} ${tokens[index + 1]}`;
      counts.set(bigram, (counts.get(bigram) ?? 0) + 1);
    }
  }

  const weighted = new Map<number, number>();
  let normSquared = 0;
  for (const [feature, count] of counts) {
    if (!Object.hasOwn(model.vocabulary, feature)) continue;
    const featureIndex = model.vocabulary[feature];
    if (featureIndex === undefined) continue;
    const tf = 1 + Math.log(count);
    const value = tf * model.idf[featureIndex];
    weighted.set(featureIndex, value);
    normSquared += value * value;
  }
  if (normSquared === 0) return "unclassified";

  const norm = Math.sqrt(normSquared);
  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let classIndex = 0; classIndex < model.classes.length; classIndex += 1) {
    let score = model.intercepts[classIndex];
    for (const [featureIndex, value] of weighted) {
      score +=
        (value / norm) * model.coefficients[classIndex][featureIndex];
    }
    if (score > bestScore) {
      bestScore = score;
      bestIndex = classIndex;
    }
  }
  return model.classes[bestIndex];
}
