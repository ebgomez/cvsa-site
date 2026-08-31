const eleventyImg = require("@11ty/eleventy-img");
const queueImage = eleventyImg.default;
const { generateHTML } = eleventyImg;
const path = require("path");

async function respImageShortcode(src, alt, sizes) {
  if (!src) return "";

  // Gallery entries store the public URL (e.g. /images/uploads/photo.jpg),
  // which the passthrough copy maps from src/images/uploads/photo.jpg.
  let inputPath = src.startsWith("/images/")
    ? path.join("src/images", src.slice("/images/".length))
    : src;

  let metadata = await queueImage(inputPath, {
    widths: [400, 800],
    formats: ["webp", "jpeg"],
    outputDir: "_site/img/",
    urlPath: "/img/",
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
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode("respImage", respImageShortcode);
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ admin: "admin" });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/blog/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("galleryPhotos", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/gallery/*.md");
  });

  eleventyConfig.addShortcode("year", function () {
    return `${new Date().getFullYear()}`;
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
