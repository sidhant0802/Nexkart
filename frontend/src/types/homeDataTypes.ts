export interface BannerStat {
  val:   string;
  label: string;
}
export interface Banner {
  _id?:        string;
  title:       string;
  highlight:   string;
  subtitle:    string;
  badge?:      string;

  cta:         string;
  ctaLink:     string;
  secondCta?:  string;
  secondLink?: string;

  image:        string;
  mobileImage?: string;   // ✅ NEW

  overlay?:    string;
  accent?:     string;

  stats?:      { val: string; label: string }[];

  isActive?:   boolean;
  order?:      number;
}

export interface SectionItem {
  _id?:          string;
  name:          string;
  categoryId:    string;
  image:         string;
  section:       "men" | "women" | "electronics" | "fashion" | "lightning" | "furniture";
  subcategory:   string;
  discount:      string;
  isActive:      boolean;   // shows on home scroll
  showInViewAll: boolean;   // shows on view all page
  order:         number;
}

export interface HomeCategory {
  _id?:             string;
  categoryId:       string;
  section?:         string;
  name?:            string;
  image:            string;
  parentCategoryId?: string;
}

interface Deal {
  category: HomeCategory;
  discount: number;
}

export interface HomeData {
  _id?: string;

  // existing
  grid:               HomeCategory[];
  shopByCategories:   HomeCategory[];
  electricCategories: HomeCategory[];
  deals:              Deal[];
  dealCategories:     HomeCategory[];

  // banners
  banners:            Banner[];

  // home scroll
  menItems:           SectionItem[];
  womenItems:         SectionItem[];
  electronicsItems:   SectionItem[];
  fashionItems:       SectionItem[];
  lightningItems:     SectionItem[];
  furnitureItems:     SectionItem[];

  // view all pages
  menViewAll:         SectionItem[];
  womenViewAll:       SectionItem[];
  electronicsViewAll: SectionItem[];
  fashionViewAll:     SectionItem[];
  dealsViewAll:       SectionItem[];
  furnitureViewAll:   SectionItem[];
}