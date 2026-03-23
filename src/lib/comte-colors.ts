/**
 * Comte brand colors — mirrors CSS variables in `globals.css` (`--comte-*`).
 * Use CSS vars in styles when possible; this object is for TS logic / docs.
 */
export const comteColors = {
  darkGreen: "#1F3A32",
  nearBlack: "#212121",
  coral: "#F27887",
  red: "#FF5252",
  gold: "#D6B84C",
  mutedGreen: "#4F7C6C",
  coolBlue: "#5F7C8A",
  lightBase: "#F9F9ED",
  warmGrey: "#676160",
  lightGrey: "#C2B7B6",
  cream: "#FBF6EF",
  yellow: "#FFFF00",
  yellowLight: "#FFFF5A",
  yellowGreen: "#C7CC00",
  deepRed: "#C50E29",
} as const;
