/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  FC,
  useMemo,
  useEffect,
  useRef,
  createContext,
  useState,
  useContext,
} from "react";
const Cite = require("citation-js");
import { mergeClassNames, mergeThemes, Creater, Theme } from "next-mathdoc";
import { useBibliography } from "./useBibliography";
import { useCSLJSON } from "./useCSLJSON";
import { CSLJSON } from "./types";

/*\
 * Locale: https://citation.js.org/api/tutorial-output_plugins_csl.html
\*/

interface Arguments {
  id: string;
  locale?: [string, string];
  template?: "apa" | "harvard";
  lang?: string;
  theme?: Theme | Theme[];
}

interface Props {
  add?: string;
  use?: string;
  className?: string;
}

interface BibContext {
  bibHTML: string;
  resources: Map<string, CSLJSON>;
  registerResource: (id: string, resource: CSLJSON) => void;
  unregisterResource: (id: string) => void;
}

const initialValue: BibContext = {
  bibHTML: "",
  resources: new Map(),
  registerResource: () => null,
  unregisterResource: () => null,
};

const classNames = {
  bibContainer: "mdplugin-bib-container",
  citeContainer: "mdplugin-cite-container",
};

export const createBibliography: Creater<Arguments> = ({
  id,
  locale,
  template = "apa",
  lang = "en-US",
  theme = [],
}) => {
  const merged = mergeThemes(classNames, theme);
  const BibContext = createContext(initialValue);

  if (locale) {
    const conf = Cite.plugins.config.get("@csl");
    conf.locales.add(locale[0], locale[1]);
  }

  const Bibliography: FC<Props> = ({ add, use = "", className }) => {
    const options = { template, lang, type: "citation" } as const;
    const bibStore = useContext(BibContext);
    const cite = useBibliography(bibStore.resources.get(use), options);
    const jsonList = useCSLJSON(add);

    useEffect(() => {
      if (add && jsonList) {
        for (const json of jsonList) {
          bibStore.registerResource(json.id, json);
        }

        return () => {
          for (const json of jsonList) {
            bibStore.unregisterResource(json.id);
          }
        };
      }
    }, [add]);

    if (add) {
      return null;
    }

    if (use && cite) {
      const citeStyle = mergeClassNames(merged.citeContainer, className);
      return (
        <div
          data-mathdoc-id={id}
          className={citeStyle}
          dangerouslySetInnerHTML={{ __html: cite }}
        />
      );
    }

    const bibStyle = mergeClassNames(merged.bibContainer, className);
    return (
      <div
        data-mathdoc-id={id}
        className={bibStyle}
        dangerouslySetInnerHTML={{ __html: bibStore.bibHTML }}
      />
    );
  };

  const Provider: FC = ({ children }) => {
    const options = { template, lang, type: "bibliography" } as const;
    const resourcesMap = useRef(new Map<string, CSLJSON>()).current;
    const bibHTML = useBibliography([...resourcesMap.values()], options);
    const [toggle, setToggle] = useState(true);
    const value: BibContext = useMemo(
      () => ({
        bibHTML: bibHTML || "",
        resources: resourcesMap,
        registerResource: (id: string, resource: CSLJSON) => {
          resourcesMap.set(id, resource);
          setToggle(!toggle);
        },
        unregisterResource: (id: string) => {
          resourcesMap.delete(id);
          setToggle(!toggle);
        },
      }),
      [toggle]
    );

    return <BibContext.Provider value={value}>{children}</BibContext.Provider>;
  };

  return { Component: Bibliography, Provider };
};
