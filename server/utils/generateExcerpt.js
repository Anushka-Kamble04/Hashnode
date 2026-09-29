const generateExcerpt = (content) => {
  const plainText = content
    .replace(/[#*_>`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > 250
    ? plainText.slice(0, 247) + "..."
    : plainText;
};

module.exports = generateExcerpt;