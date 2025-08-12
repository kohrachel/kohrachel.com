type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

type HeadingElement = {
  type: "heading";
  level: number;
  children: CustomText[];
};

type CodeElement = {
  type: "code";
  children: CustomText[];
};

export type CustomElement = ParagraphElement | HeadingElement | CodeElement;

export type FormattedText = { text: string; bold?: true; italic?: true };

export type CustomText = FormattedText;
