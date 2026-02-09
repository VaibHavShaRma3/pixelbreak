"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, User, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { seedBlogPosts } from "@/lib/blog-seed";
import type { BlogPost } from "@/types/blog";

/**
 * Simple markdown renderer: handles headings, bold, italic,
 * code blocks, line breaks, list items, horizontal rules, and paragraphs.
 */
function renderMarkdown(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <pre
          key={`code-${i}`}
          className="my-4 overflow-x-auto rounded-lg border border-border bg-surface-2 p-4"
        >
          <code className="text-sm text-neon-green">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rules
    if (line.trim() === "---" || line.trim() === "***") {
      nodes.push(
        <hr
          key={`hr-${i}`}
          className="my-6 border-border"
        />
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      nodes.push(
        <h1
          key={`h1-${i}`}
          className="mb-4 mt-8 font-[family-name:var(--font-pixel)] text-2xl text-neon-cyan glow-cyan"
        >
          {inlineMarkdown(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={`h2-${i}`}
          className="mb-3 mt-6 font-[family-name:var(--font-pixel)] text-xl text-neon-pink"
        >
          {inlineMarkdown(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3
          key={`h3-${i}`}
          className="mb-2 mt-4 font-semibold text-lg text-neon-green"
        >
          {inlineMarkdown(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // List items
    if (line.startsWith("- ")) {
      nodes.push(
        <li
          key={`li-${i}`}
          className="ml-6 list-disc text-foreground/90"
        >
          {inlineMarkdown(line.slice(2))}
        </li>
      );
      i++;
      continue;
    }

    // Empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraphs
    nodes.push(
      <p key={`p-${i}`} className="my-2 leading-relaxed text-foreground/90">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

/** Handle inline markdown: **bold**, *italic*, `code`, and inline backticks */
function inlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex for bold, italic, inline code
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[4]) {
      // Italic
      parts.push(
        <em key={`i-${match.index}`} className="italic text-foreground/80">
          {match[4]}
        </em>
      );
    } else if (match[6]) {
      // Inline code
      parts.push(
        <code
          key={`c-${match.index}`}
          className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-neon-yellow"
        >
          {match[6]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function PostSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-8 h-10 w-3/4" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-8 h-56 w-full rounded-lg" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (data.post) {
          setPost({
            ...data.post,
            createdAt: new Date(data.post.createdAt),
            updatedAt: new Date(data.post.updatedAt),
          });
        } else {
          throw new Error("No post");
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to seed data
        const seed = seedBlogPosts.find((p) => p.slug === slug);
        if (seed) {
          setPost(seed);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <PostSkeleton />;
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
        <div className="mt-16 flex flex-col items-center gap-4">
          <BookOpen className="h-16 w-16 text-muted/30" />
          <h1 className="font-[family-name:var(--font-pixel)] text-xl text-muted">
            Post not found
          </h1>
          <p className="text-sm text-muted">
            The blog post you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Back link */}
      <ScrollReveal direction="left">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </ScrollReveal>

      {/* Title */}
      <ScrollReveal direction="up" delay={100}>
        <h1 className="mt-8 font-[family-name:var(--font-pixel)] text-2xl leading-tight text-neon-cyan glow-cyan md:text-3xl">
          {post.title}
        </h1>
      </ScrollReveal>

      {/* Author + Date */}
      <ScrollReveal direction="up" delay={200}>
        <div className="mt-4 flex items-center gap-3">
          {post.authorImage ? (
            <Image
              src={post.authorImage}
              alt={post.authorName || "Author"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-purple/20">
              <User className="h-4 w-4 text-neon-purple" />
            </div>
          )}
          <span className="text-sm text-foreground">
            {post.authorName || "Anonymous"}
          </span>
          <div className="flex items-center gap-1 text-sm text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {timeAgo(new Date(post.createdAt))}
          </div>
        </div>
      </ScrollReveal>

      {/* Cover Image */}
      {post.coverImage && (
        <ScrollReveal direction="up" delay={300}>
          <div className="relative mt-8 h-64 overflow-hidden rounded-xl md:h-80">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        </ScrollReveal>
      )}

      {/* Content */}
      <ScrollReveal direction="up" delay={post.coverImage ? 400 : 300}>
        <article className="prose-invert mt-8 max-w-none">
          {renderMarkdown(post.content)}
        </article>
      </ScrollReveal>

      {/* Bottom back link */}
      <ScrollReveal direction="up" delay={500}>
        <div className="mt-12 border-t border-border pt-6">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
