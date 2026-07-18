module.exports = {
  extends: 'markdownlint/style/relaxed',
  MD003: { style: 'consistent' },
  MD004: { style: 'consistent' },
  MD013: {
    line_length: 80,
    heading_line_length: 80,
    header_line_length: 80,
    code_line_length: 100,
    code_blocks: true,
    tables: true,
  },
};
