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
import { useCitation } from "./useCitation";

/*\
 * Locale: https://citation.js.org/api/tutorial-output_plugins_csl.html
\*/

interface Arguments {
  id: string;
  locale?: [string, string];
  theme?: Theme | Theme[];
}

interface Props {
  add?: string;
  template?: "apa" | "vancouver" | "harvard";
  lang?: string;
  className?: string;
}

interface BibContext {
  resources: string[];
  registerResource: (x: symbol, y: string) => void;
  unregisterResource: (x: symbol) => void;
}

const initialValue: BibContext = {
  resources: [],
  registerResource: () => null,
  unregisterResource: () => null,
};

const classNames = {
  bibContainer: "mdplugin-bib-container",
};

export const createBibliography: Creater<Arguments> = ({
  id,
  locale,
  theme = [],
}) => {
  const merged = mergeThemes(classNames, theme);
  const BibContext = createContext(initialValue);

  if (locale) {
    const conf = Cite.plugins.config.get("@csl");
    conf.locales.add(locale[0], locale[1]);
  }

  const Bibliography: FC<Props> = ({
    add,
    template = "apa",
    lang = "en-US",
    className,
  }) => {
    const containerStyle = mergeClassNames(merged.bibContainer, className);
    const symbol = useRef(Symbol()).current;
    const { resources, registerResource, unregisterResource } = useContext(
      BibContext
    );
    const bibHTML = useCitation(resources, { template, lang });

    useEffect(() => {
      if (add) {
        registerResource(symbol, add);
        return () => unregisterResource(symbol);
      }
    }, [add]);

    if (add) {
      return null;
    }

    return (
      <div
        data-mathdoc-id={id}
        className={containerStyle}
        dangerouslySetInnerHTML={{ __html: bibHTML }}
      />
    );
  };

  const Provider: FC = ({ children }) => {
    const resourcesMap = useRef(new Map<symbol, any>()).current;
    const [toggle, setToggle] = useState(true);
    const value: BibContext = useMemo(
      () => ({
        resources: [...resourcesMap.values()],
        registerResource: (id: symbol, resource: string) => {
          resourcesMap.set(id, resource);
          setToggle(!toggle);
        },
        unregisterResource: (id: symbol) => {
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
