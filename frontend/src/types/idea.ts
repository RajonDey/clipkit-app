export type ClipType = "text" | "image" | "video" | "code" | "link";

export interface Clip {
  id: string; // Changed from number to string to match backend UUID format
  type: ClipType;
  content: string;
  created: string;
  tags: string[];
  lang?: string; // Optional language for code clips
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  clips: Clip[];
}

export interface ContentTypeOption {
  value: ClipType | "all";
  label: string;
  icon?: string;
}

export interface TypeMeta {
  color: string;
  icon: string;
  label: string;
}
