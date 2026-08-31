module.exports = function (eleventyConfig) {
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
