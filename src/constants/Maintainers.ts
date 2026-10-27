// src/constants/maintainers.ts

export const MAINTAINERS = new Set<string>([
  "07calc",
  "joYBoY1210",
  "Pratikrkcha",
  "BluesIsekai",
  "23abdul23",
  "Washiki",
  "Shravanimath",
  "VaidikKindaCodes",
  "MishtiGarg250",
  "Aryan9059",
  "adith-nr",
  "AnandMayank",
  "sankalpj47",
  "Suvanwita",
  "Surya-Raghuram",
  "Paraspandey-debugs",
  "angrycrax",
  "Dheeraj-06",
  "aadyagupta23",
  "Aryan-coder06",
  "SaqlainSQX",
  "HGRgamer",
  "Vichanshu",
  "Scorchedpearl",
  "yash194",
  "sahilgupta2006",
  "Zonedoutdg",
  "Rational-Idiot",
  "bitflipper19",
  "ShubhamKumarSahu-svg",
  "Soham-Donode",
  "Vinesh-27",
  "shrmaanubhav",
  "krichyrich",
  "kyanmahajan",
  "ShonWaghchoure",
  "Jazzrahi",
  "Goddbott",
]);

const MAINTAINERS_LOWER = new Set(
  Array.from(MAINTAINERS).map((id) => id.trim().toLowerCase())
);

export const isMaintainer = (githubId?: string | null): boolean => {
  if (!githubId) return false;
  const clean = githubId.trim().toLowerCase();
  return MAINTAINERS.has(githubId.trim()) || MAINTAINERS_LOWER.has(clean);
};
