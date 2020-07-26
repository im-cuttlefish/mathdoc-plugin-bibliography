import { useRef, useState } from "react";
const Cite = require("citation-js");

interface Options {
  template: "apa" | "harvard" | "vancouver";
  lang: string;
}

const isSameArray = (x: string[], y: string[]) =>
  x.length === y.length && x.every((u, i) => u === y[i]);

export const useCitation = (
  resources: string[],
  { template, lang }: Options
) => {
  const cite = useRef(new Cite()).current;
  const [prev, setPrev] = useState([""]);
  const [memo, memoize] = useState("");

  if (isSameArray(resources, prev)) {
    return memo;
  }

  const html = cite.reset().add(resources).format("bibliography", {
    format: "html",
    template,
    lang,
  });

  memoize(html);
  setPrev([...resources]);

  return html;
};
