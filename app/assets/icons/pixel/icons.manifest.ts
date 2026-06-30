const manifest = {
  "home": {
    category: "ui",
    baseSize: 24,
    tags: ["nav"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "play": {
    category: "ui",
    baseSize: 24,
    tags: ["start","action"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "pause": {
    category: "ui",
    baseSize: 24,
    tags: ["control"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "back": {
    category: "ui",
    baseSize: 24,
    tags: ["nav"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "forward": {
    category: "ui",
    baseSize: 24,
    tags: ["nav"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "settings": {
    category: "ui",
    baseSize: 24,
    tags: ["menu"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "info": {
    category: "ui",
    baseSize: 24,
    tags: ["help"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "help": {
    category: "ui",
    baseSize: 24,
    tags: ["help"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "star": {
    category: "ui",
    baseSize: 24,
    tags: ["favorite"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "trophy": {
    category: "ui",
    baseSize: 24,
    tags: ["achievement"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "leaderboard": {
    category: "ui",
    baseSize: 24,
    tags: ["rank"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "user": {
    category: "ui",
    baseSize: 24,
    tags: ["profile"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "book": {
    category: "ui",
    baseSize: 24,
    tags: ["learn"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "question": {
    category: "ui",
    baseSize: 24,
    tags: ["quiz"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "geography": {
    category: "ui",
    baseSize: 24,
    tags: ["geography"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "lightning": {
    category: "ui",
    baseSize: 24,
    tags: ["power"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "scissors": {
    category: "ui",
    baseSize: 24,
    tags: ["tools"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "skip": {
    category: "ui",
    baseSize: 24,
    tags: ["control"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "clock": {
    category: "ui",
    baseSize: 24,
    tags: ["time"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "heart": {
    category: "hud",
    baseSize: 32,
    tags: ["life"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "gem": {
    category: "hud",
    baseSize: 32,
    tags: ["currency"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "xp": {
    category: "hud",
    baseSize: 32,
    tags: ["xp"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "streak": {
    category: "hud",
    baseSize: 32,
    tags: ["streak"],
    sourceUrl: "",
    png: {

    },
    svg: null
  },
  "life": {
    category: "hud",
    baseSize: 32,
    tags: ["life"],
    sourceUrl: "",
    png: {

    },
    svg: null
  }
} as const;

export default manifest;
export type IconName = keyof typeof manifest;
