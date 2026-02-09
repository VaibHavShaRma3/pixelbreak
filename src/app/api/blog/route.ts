import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const [post] = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          content: blogPosts.content,
          excerpt: blogPosts.excerpt,
          coverImage: blogPosts.coverImage,
          published: blogPosts.published,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt,
          authorName: users.name,
          authorImage: users.image,
        })
        .from(blogPosts)
        .innerJoin(users, eq(blogPosts.authorId, users.id))
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ post });
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        createdAt: blogPosts.createdAt,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(blogPosts)
      .innerJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt))
      .limit(20);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
