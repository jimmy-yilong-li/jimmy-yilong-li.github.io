export interface Resource {
  label: string;
  href: string;
}

export interface ResearchSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  image?: { src: string; alt: string; caption: string };
}

export interface ResearchWork {
  slug: string;
  name: string;
  title: string;
  category: 'On-Device AI' | 'On-Device Agents' | 'Efficient Models' | 'Wireless Sensing';
  kind: 'Paper' | 'Project';
  venue: string;
  summary: string;
  cover: string;
  coverAlt: string;
  coverFit?: 'cover' | 'contain';
  coverPosition?: string;
  imageCaption: string;
  publicationId?: string;
  authorHtml?: string;
  resources: Resource[];
  sections: ResearchSection[];
  highlights?: { value: string; label: string; note?: string }[];
  related?: string[];
}
