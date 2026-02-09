"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Search, User } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";
import { seedBlogPosts } from "@/lib/blog-seed";
import type { BlogPostSummary } from "@/types/blog";

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-5/6" />
      <Skeleton className="mt-1 h-4 w-2/3" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-4 w-16" />
      </div>
    </div>
  );
}

const gradientColors = [
  "from-accent-primary/30 to-accent-secondary/20",
  "from-accent-secondary/30 to-accent-purple/20",
  "from-accent-tertiary/30 to-accent-primary/20",
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.posts || [];
        if (fetched.length === 0) {
          // Fallback to seed data when API returns empty
          setPosts(
            seedBlogPosts.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              excerpt: p.excerpt,
              coverImage: p.coverImage,
              createdAt: p.createdAt,
              authorName: p.authorName,
              authorImage: p.authorImage,
            }))
          );
        } else {
          setPosts(
            fetched.map((p: BlogPostSummary) => ({
              ...p,
              createdAt: new Date(p.createdAt),
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => {
        // On error, use seed data
        setPosts(
          seedBlogPosts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            coverImage: p.coverImage,
            createdAt: p.createdAt,
            authorName: p.authorName,
            authorImage: p.authorImage,
          }))
        );
        setLoading(false);
      });
  }, []);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
    );
  }, [posts, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Header */}
      <ScrollReveal direction="down">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-accent-secondary" />
          <h1 className="text-4xl font-extrabold text-foreground">
            Blog
          </h1>
        </div>
        <p className="mt-2 text-muted">
          Game updates, dev logs, and reviews.
        </p>
      </ScrollReveal>

      {/* Search / Filter Bar */}
      <ScrollReveal direction="up" delay={100}>
        <div className="relative mt-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </ScrollReveal>

      {/* Posts Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <ScrollReveal direction="up" delay={200}>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex flex-col items-center gap-4 py-16">
                <BookOpen className="h-12 w-12 text-muted" />
                <p className="text-muted">
                  {search.trim()
                    ? "No posts match your search."
                    : "No posts yet. Check back soon!"}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts.map((post, i) => (
              <ScrollReveal key={post.id} direction="up" delay={i * 100}>
                <Link href={`/blog/${post.slug}`}>
                  <TiltCard
                    glowColor={
                      i % 3 === 0
                        ? "#1D4ED8"
                        : i % 3 === 1
                          ? "#DC2626"
                          : "#16A34A"
                    }
                    className="h-full cursor-pointer"
                  >
                    {/* Cover Image Area */}
                    {post.coverImage ? (
                      <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden rounded-t-2xl">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`-mx-6 -mt-6 mb-4 flex h-48 items-center justify-center rounded-t-2xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]}`}
                      >
                        <BookOpen className="h-12 w-12 text-muted/50" />
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-lg font-bold text-foreground">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="mt-2 line-clamp-3 text-sm text-muted">
                      {post.excerpt}
                    </p>

                    {/* Author + Date */}
                    <div className="mt-4 flex items-center gap-2">
                      {post.authorImage ? (
                        <Image
                          src={post.authorImage}
                          alt={post.authorName || "Author"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-purple/20">
                          <User className="h-3 w-3 text-accent-purple" />
                        </div>
                      )}
                      <span className="text-xs text-foreground">
                        {post.authorName || "Anonymous"}
                      </span>
                      <span className="ml-auto text-xs text-muted">
                        {timeAgo(new Date(post.createdAt))}
                      </span>
                    </div>
                  </TiltCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
