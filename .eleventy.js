const eleventyImg = require("@11ty/eleventy-img");
const queueImage = eleventyImg.default;
const { generateHTML } = eleventyImg;
const path = require("path");
const fs = require("fs");

function toFilePath(publicPath) {
  return publicPath.startsWith("/images/")
    ? path.join("src/images", publicPath.slice("/images/".length))
    : publicPath;
}

async function respImageShortcode(src, alt, sizes) {
  if (!src) return "";

  // Gallery entries store the public URL (e.g. /images/uploads/photo.jpg),
  // which the passthrough copy maps from src/images/uploads/photo.jpg.
  let inputPath = toFilePath(src);

  try {
    let metadata = await queueImage(inputPath, {
      widths: [400, 800],
      formats: ["webp", "jpeg"],
      outputDir: "_site/img/",
      urlPath: "/img/",
      // Phone photos often carry an EXIF "please rotate this" flag rather
      // than storing pixels upright. By default this library only
      // auto-corrects a narrow set of rotations (90°/270°) — force it for
      // every orientation value (including 180°/mirrored) so a photo that
      // looks correct in the CMS never comes out sideways or upside-down
      // in the resized output.
      fixOrientation: true,
      filenameFormat: function (id, filePath, width, format) {
        const name = path.basename(filePath, path.extname(filePath));
        return `${name}-${width}w.${format}`;
      },
    });

    return generateHTML(metadata, {
      alt: alt || "",
      sizes: sizes || "(min-width: 820px) 33vw, 50vw",
      loading: "lazy",
      decoding: "async",
    });
  } catch (err) {
    // A single broken/missing image (e.g. its file was deleted from the
    // media library but a gallery entry still points at it) must never
    // take down the whole site build. Skip it and keep going.
    console.warn(`[gallery] Skipping missing/broken image "${src}": ${err.message}`);
    return "";
  }
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode("respImage", respImageShortcode);
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/files": "files" });
  eleventyConfig.addPassthroughCopy({ admin: "admin" });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/blog/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("videos", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/videos/*.md");
  });

  eleventyConfig.addShortcode("year", function () {
    return `${new Date().getFullYear()}`;
  });

  // Merges the two gallery sources (bulk "quick photos" and the fuller
  // per-item Gallery Photos & Videos collection) into one list of plain
  // objects the media-tile macro can render, optionally capped to `limit`.
  eleventyConfig.addFilter("combineMedia", function (quickPhotos, galleryEntries, limit) {
    // Decap's multi-select image widget stores a single selection as a
    // plain string instead of a one-item array — normalize defensively
    // so this can never break the build again, no matter how many
    // photos are selected.
    // Reversed so the most recently added photo (added photos append to
    // the end of the list) comes first — the homepage's "first N" then
    // naturally shows the newest photos, not an arbitrary fixed set.
    var quickList = Array.isArray(quickPhotos)
      ? quickPhotos.slice().reverse()
      : quickPhotos
      ? [quickPhotos]
      : [];
    var items = quickList.map(function (src) {
      return { image: src };
    });
    (galleryEntries || []).forEach(function (entry) {
      items.push(entry.data);
    });

    // Drop anything whose file was deleted from the media library while
    // an entry (or the Quick Photos list) still pointed at it — shows up
    // as a blank tile otherwise. Link-based videos have no local file.
    items = items.filter(function (item) {
      if (item.videoUrl) return true;
      var src = item.image || item.video;
      if (!src) return false;
      return fs.existsSync(toFilePath(src));
    });

    // De-duplicate: the same photo can end up listed twice if it's added
    // to both Quick Photos and as its own Gallery entry.
    var seen = {};
    items = items.filter(function (item) {
      var key = item.image || item.video || item.videoUrl;
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });

    return limit ? items.slice(0, limit) : items;
  });

  eleventyConfig.addFilter("jsonify", function (value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addFilter("embedUrl", function (url) {
    if (!url) return null;
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (yt) return "https://www.youtube.com/embed/" + yt[1];
    var vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return "https://player.vimeo.com/video/" + vimeo[1];
    return url;
  });

  eleventyConfig.addFilter("dateDisplay", function (dateObj) {
    return new Date(dateObj).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
