import { content, profile as baseProfile, GITHUB_USERNAME, type Lang } from "@/content/cv";
import cvAsset from "@/assets/cv.pdf.asset.json";
import portraitAsset from "@/assets/erick-portrait.png.asset.json";

export type Dict = (typeof content)["es"];

export type SiteProfile = {
  name: string;
  initials: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  githubUser: string;
  cvUrl: string;
  portraitUrl: string;
};

export type SiteData = {
  profile: SiteProfile;
  es: Dict;
  en: Dict;
};

export const defaultSiteData: SiteData = {
  profile: {
    ...baseProfile,
    github: GITHUB_USERNAME ? `https://github.com/${GITHUB_USERNAME}` : "",
    githubUser: GITHUB_USERNAME,
    cvUrl: cvAsset.url,
    portraitUrl: portraitAsset.url,
  },
  es: content.es,
  en: content.en,
};

type Plain = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Plain =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Deep merge overrides over defaults. Arrays are replaced wholesale. */
export function mergeSiteData(overrides: unknown): SiteData {
  const merge = (base: unknown, patch: unknown): unknown => {
    if (patch === undefined || patch === null) return base;
    if (isPlainObject(base) && isPlainObject(patch)) {
      const out: Plain = { ...base };
      for (const key of Object.keys(patch)) out[key] = merge(base[key], patch[key]);
      return out;
    }
    return patch;
  };

  return merge(defaultSiteData, overrides) as SiteData;
}

export const langs: Lang[] = ["es", "en"];
