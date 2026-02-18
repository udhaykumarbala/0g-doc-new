/**
 * Markdown Endpoint Plugin for Docusaurus
 *
 * Enables LLM-compatible endpoints by serving raw markdown files at .md URLs.
 * For example: docs.0g.ai/concepts/compute.md returns raw markdown content.
 *
 * This allows AI tools and LLMs to programmatically ingest documentation
 * without needing to parse HTML.
 *
 * @see https://github.com/0gfoundation/0g-doc/issues/242
 */

const fs = require('fs');
const path = require('path');

module.exports = function markdownEndpointPlugin(context, options) {
  return {
    name: 'markdown-endpoint-plugin',

    async postBuild({ siteConfig, routesPaths, outDir }) {
      const docsDir = path.join(context.siteDir, 'docs');

      console.log('\n[markdown-endpoint] Starting markdown file copy...\n');

      let copiedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      /**
       * Recursively copy markdown files from source to destination
       * @param {string} srcDir - Source directory
       * @param {string} destDir - Destination directory
       * @param {string} relativePath - Current relative path for logging
       */
      function copyMarkdownFiles(srcDir, destDir, relativePath = '') {
        if (!fs.existsSync(srcDir)) {
          console.warn(`[markdown-endpoint] Source directory not found: ${srcDir}`);
          return;
        }

        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        const items = fs.readdirSync(srcDir);

        for (const item of items) {
          const srcPath = path.join(srcDir, item);
          const destPath = path.join(destDir, item);
          const currentRelativePath = relativePath ? path.join(relativePath, item) : item;
          const stat = fs.statSync(srcPath);

          if (stat.isDirectory()) {
            // Skip hidden directories and node_modules
            if (item.startsWith('.') || item === 'node_modules') {
              continue;
            }
            copyMarkdownFiles(srcPath, destPath, currentRelativePath);
          } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
            try {
              if (fs.existsSync(destPath)) {
                const srcStat = fs.statSync(srcPath);
                const destStat = fs.statSync(destPath);

                if (srcStat.mtime > destStat.mtime) {
                  fs.copyFileSync(srcPath, destPath);
                  copiedCount++;
                } else {
                  skippedCount++;
                }
              } else {
                fs.copyFileSync(srcPath, destPath);
                copiedCount++;
              }
            } catch (error) {
              console.error(`[markdown-endpoint] Error copying ${currentRelativePath}:`, error.message);
              errorCount++;
            }
          }
        }
      }

      copyMarkdownFiles(docsDir, outDir);

      console.log('[markdown-endpoint] Summary:');
      console.log(`  Copied: ${copiedCount} files`);
      console.log(`  Skipped: ${skippedCount} files (up-to-date)`);
      console.log(`  Errors: ${errorCount} files`);
      console.log('[markdown-endpoint] Markdown files ready for LLM access!\n');
    },

    // Serve raw markdown in development
    configureWebpack(config, isServer, utils) {
      return {
        devServer: {
          setupMiddlewares: (middlewares, devServer) => {
            devServer.app.get('*.md', (req, res, next) => {
              const docsDir = path.join(context.siteDir, 'docs');
              const requestedPath = req.path.replace(/^\//, '');
              const filePath = path.join(docsDir, requestedPath);

              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.sendFile(filePath);
              } else {
                // Try .mdx if .md not found
                const mdxPath = filePath.replace('.md', '.mdx');
                if (fs.existsSync(mdxPath)) {
                  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.sendFile(mdxPath);
                } else {
                  next();
                }
              }
            });
            return middlewares;
          },
        },
      };
    },
  };
};
