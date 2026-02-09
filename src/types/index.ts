export * from "./game";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  username: string | null;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  authorId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  gameSlug: string;
  userId: string;
  rating: number; // 1-5
  content: string;
  createdAt: Date;
}
