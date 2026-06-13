/* Eleventy — piloto Decap CMS para la demo pacacervera.
   El sitio sigue siendo 100% estático: 11ty solo inyecta el contenido
   editable (src/_data/home.json, que es lo que toca el cliente desde Decap)
   en la plantilla src/index.njk, que conserva el HTML/efectos originales. */
module.exports = function (eleventyConfig) {
  // Activos que el cliente no toca: se copian tal cual a la salida.
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" }); // panel Decap
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // Filtro de texto enriquecido seguro: escapa el HTML del campo del CMS y
  // luego admite *énfasis* -> <em> y [texto](url) -> enlace con estilo de la casa.
  eleventyConfig.addFilter("inline", function (str) {
    if (!str) return "";
    let s = String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    s = s.replace(/\[(.+?)\]\((.+?)\)/g, '<a class="link-stitch" href="$2">$1</a>');
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return s;
  });

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
