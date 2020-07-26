import { useMemo } from "react";
const Cite = require("citation-js");
import { CSLJSON } from "./types";

export const useCSLJSON = (resource: string | undefined) => {
  return useMemo(() => {
    if (!resource) {
      return null;
    }

    const cite = Cite.input(resource) as CSLJSON[];
    return cite;
  }, [resource]);
};
