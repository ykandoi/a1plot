const BASE = 'https://a1plot.com';

// Dynamic robots.txt. Explicitly welcomes major AI crawlers (GPTBot, ClaudeBot,
// PerplexityBot, Google-Extended, CCBot…) for AI search visibility, and points
// them at the sitemap + the llms.txt AI context file.
export default function robots() {
  const aiAgents = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'anthropic-ai', 'ClaudeBot', 'Claude-Web', 'CCBot', 'PerplexityBot', 'Applebot-Extended', 'Bytespider', 'Amazonbot'];

  return {
    rules: [
      // Keep auth-gated / private app screens out of the index.
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin_edit', '/admin_map', '/dashboard', '/edit_property', '/login', '/interests', '/buy_request'] },
      ...aiAgents.map(userAgent => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
