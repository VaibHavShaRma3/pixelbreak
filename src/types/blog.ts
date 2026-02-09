export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
  authorImage: string | null;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  createdAt: Date;
  authorName: string | null;
  authorImage: string | null;
}
