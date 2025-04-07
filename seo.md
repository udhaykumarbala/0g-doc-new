# SEO Analysis and Improvement Plan for `docs.0g.ai`

**1. Configuration (`docusaurus.config.ts`)**

*   **Good:**
    *   Site `title`, `tagline`, `url`, `baseUrl`, and `favicon` are set correctly.
    *   Google Analytics (`gtag`) is configured for tracking.
    *   Language (`i18n`) is correctly set to English.
*   **Improvements:**
    *   **Missing Global Meta Description:** No default meta description is set in `themeConfig`. Search engines might generate suboptimal descriptions for pages lacking specific ones.
    *   **Basic Social Metadata:** While Docusaurus might infer some Open Graph/Twitter tags, explicit configuration for `og:image`, `twitter:card`, etc., is missing, potentially leading to poor link previews when shared.

**2. Static Files (`static/`)**

*   **Good:**
    *   The `_headers` file correctly sets security headers without blocking crawlers.
*   **Improvements:**
    *   **Missing `robots.txt`:** Essential file to guide search engine crawlers is absent.
    *   **Sitemap:** Docusaurus likely generates `sitemap.xml` during build, but this should be verified and the sitemap submitted to search consoles.

**3. Source Code (`src/`)**

*   **Good:**
    *   The `security-headers-plugin` only affects the development server and doesn't add conflicting production headers.
    *   Theme customizations (`src/theme/Footer`) are unlikely to negatively impact SEO.

**4. Content (`docs/`)**

*   **Area for Review:** The actual content within the Markdown files (`.md`) is crucial. On-page SEO practices (titles, descriptions in front matter, heading structure, keyword usage, alt text for images, internal linking) need review and optimization.

**5. Plugins**

*   **Search:** Uses `@easyops-cn/docusaurus-search-local` for client-side search. This doesn't directly impact SEO indexing but affects user experience.

**Recommendations:**

1.  **Create `static/robots.txt`:**
    *   **Purpose:** Guide search engine crawlers.
    *   **Action:** Create the file with content allowing all crawlers and pointing to the sitemap.
    *   **Example:**
        ```robots.txt
        User-agent: *
        Allow: /

        Sitemap: https://docs.0g.ai/sitemap.xml
        ```

2.  **Verify Sitemap & Submit:**
    *   **Purpose:** Ensure search engines can discover all pages.
    *   **Action:** Run a production build (`yarn build` or `npm run build`), confirm `build/sitemap.xml` exists and is complete. Submit `https://docs.0g.ai/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

3.  **Add Global Metadata (`docusaurus.config.ts`):**
    *   **Purpose:** Provide default descriptions and improve social sharing previews.
    *   **Action:** Modify `themeConfig` to include a `metadata` array.
    *   **Example Snippet (add within `themeConfig`):**
        ```typescript
        metadata: [
          // 1. Global Description
          {name: 'description', content: 'Explore the official 0G documentation for the decentralized AI blockchain. Learn about 0G Storage, node operation, and building the future of Web3 AI infrastructure.'}, // Customize this!

          // 2. Social Sharing Tags (Open Graph & Twitter)
          {property: 'og:image', content: 'https://docs.0g.ai/img/og-image.png'}, // IMPORTANT: Create this image and update path
          {name: 'twitter:card', content: 'summary_large_image'},
          {name: 'twitter:site', content: '@0g_labs'}, // Add your site's Twitter handle
        ],
        ```
    *   **Action:** Create a compelling social sharing image (e.g., 1200x630px) and save it as `static/img/og-image.png` (or update the path in the config).

4.  **Implement Schema Markup (`docusaurus.config.ts`):**
    *   **Purpose:** Help search engines understand your site's content and structure better.
    *   **Action:** Add JSON-LD schema for `Organization` globally in `themeConfig.metadata`. Consider adding `TechArticle` schema for individual docs later.
    *   **Example Snippet (add to `themeConfig.metadata` array):**
        ```typescript
         {
           name: 'jsonld:organization',
           content: JSON.stringify({
             '@context': 'https://schema.org',
             '@type': 'Organization',
             'name': '0G Labs',
             'url': 'https://docs.0g.ai',
             'logo': 'https://docs.0g.ai/img/logo.svg', // Ensure absolute URL
             'sameAs': [
               'https://twitter.com/0g_labs',
               'https://github.com/0glabs',
               'https://0g.ai/'
              ]
           }),
         },
        ```

5.  **Optimize On-Page Content (`docs/**/*.md`):**
    *   **Purpose:** Improve ranking for specific documentation topics.
    *   **Action:** Review/add `title` and `description` front matter to each page. Use headings (`##`, `###`) correctly. Incorporate relevant keywords naturally. Add `alt` text to images. Link related pages together.

6.  **Monitor Performance:**
    *   **Purpose:** Ensure fast loading times (ranking factor & UX).
    *   **Action:** Use tools like Google PageSpeed Insights. Optimize images and review asset sizes.
