import { useState } from "react";
import { CSLJSON, Options } from "./types";
const Cite = require("citation-js");

const isSameArray = (x: unknown[], y: unknown[]) =>
  x.length === y.length && x.every((u, i) => u === y[i]);

export const useBibliography = (
  resources: CSLJSON | CSLJSON[] | undefined,
  { template, lang, type }: Options
) => {
  const [prev, setPrev] = useState<string[] | CSLJSON[]>([]);
  const [memo, memoize] = useState<string>("");

  if (!resources) {
    return null;
  }

  if (!Array.isArray(resources)) {
    resources = [resources];
  }

  if (isSameArray(resources, prev)) {
    return memo;
  }

  const html: string = new Cite(resources).format(type, {
    format: "html",
    template,
    lang,
  });

  memoize(html);
  setPrev(resources);

  return html;
};
