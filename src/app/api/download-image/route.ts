import { NextRequest } from "next/server";

const allowedHosts = new Set([
  "pub-57b44696f3e243acb6e5fdb88145606e.r2.dev",
  "3557411483e1c743ec899c045c89e64c.r2.cloudflarestorage.com",
]);

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing image URL", { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  if (parsedUrl.protocol !== "https:" || !allowedHosts.has(parsedUrl.hostname)) {
    return new Response("Image host is not allowed", { status: 403 });
  }

  const imageResponse = await fetch(parsedUrl, { cache: "no-store" });
  if (!imageResponse.ok || !imageResponse.body) {
    return new Response("Unable to fetch image", { status: 502 });
  }

  return new Response(imageResponse.body, {
    headers: {
      "Content-Type": imageResponse.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}