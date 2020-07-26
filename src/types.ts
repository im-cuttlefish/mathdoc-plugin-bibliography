export interface Options {
  type: "bibliography" | "citation";
  template: "apa" | "harvard";
  lang: string;
}

export type CSLJSON = {
  id: string;
} & {
  [T in string]?: string;
};
