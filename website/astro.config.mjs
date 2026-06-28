// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import path from "node:path";

const BASE = "/tau/";
const DOCS_ROOT = path.resolve("./src/content/docs");

/**
 * Rewrite relative Markdown links (e.g. `foo.md`, `./foo.md`, `../bar/baz.md`)
 * to their final Starlight route under `base`. Astro does not do this on its own.
 */
function remarkRelativeMdLinks() {
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    const filePath = (file.history && file.history[0]) || file.path;
    if (!filePath) return;
    const fileDir = path.dirname(filePath);
    const visit = (/** @type {any} */ node) => {
      if (node.type === "link" && typeof node.url === "string") {
        const url = node.url;
        if (
          url &&
          !/^https?:\/\//.test(url) &&
          !url.startsWith("/") &&
          !url.startsWith("#")
        ) {
          const hash = url.indexOf("#");
          const p = hash >= 0 ? url.slice(0, hash) : url;
          const anchor = hash >= 0 ? url.slice(hash) : "";
          if (p.endsWith(".md")) {
            const abs = path.resolve(fileDir, p);
            let slug = path
              .relative(DOCS_ROOT, abs)
              .replace(/\\/g, "/")
              .replace(/\.md$/, "")
              .toLowerCase();
            if (slug.endsWith("/index")) slug = slug.slice(0, -6);
            if (slug === "index") slug = "";
            node.url = BASE + (slug ? slug + "/" : "") + anchor;
          }
        }
      }
      if (node.children) for (const c of node.children) visit(c);
    };
    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://alejandro-ao.github.io",
  base: BASE,
  markdown: {
    remarkPlugins: [remarkRelativeMdLinks],
  },
  integrations: [
    starlight({
      title: "Tau",
      description:
        "An educational Python project for learning how coding agents are built.",
      logo: { src: "./src/assets/tau-glyph.svg", replacesTitle: false },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/alejandro-ao/tau",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/alejandro-ao/tau/edit/main/website/",
      },
      customCss: ["./src/styles/custom.css"],
      // Landing pages live as standalone routes in src/pages/.
      pagefind: true,
      sidebar: [
        { label: "Home", link: "/" },
        { label: 'Why "Tau"?', link: "/why-tau/" },
        { label: "Getting Started", slug: "getting-started" },
        { label: "Installation", slug: "installation" },
        { label: "Configuration and Files", slug: "configuration" },
        { label: "Providers", slug: "providers" },
        { label: "Context Compaction", slug: "context-compaction" },
        { label: "Building a Custom TUI", slug: "custom-tui" },
        { label: "Agent Loop", slug: "agent-loop" },
        { label: "Agent Harness", slug: "harness" },
        {
          label: "Design",
          items: [
            { label: "Roadmap", slug: "00-roadmap" },
            { label: "Architecture Overview", slug: "01-architecture" },
            { label: "Agent Loop", slug: "02-agent-loop" },
            { label: "Tools", slug: "03-tools" },
            { label: "Sessions", slug: "04-sessions" },
            { label: "Core Types and Events", slug: "05-core-types-and-events" },
          ],
        },
        {
          label: "Architecture Notes",
          items: [
            { label: "Overview", slug: "architecture" },
            { label: "Phase 1: Core Types and Events", slug: "architecture/phase-1-core-types-and-events" },
            { label: "Phase 2: AI Provider Layer", slug: "architecture/phase-2-ai-provider-layer" },
            { label: "Phase 3: Pure Agent Loop", slug: "architecture/phase-3-agent-loop" },
            { label: "Phase 4: AgentHarness", slug: "architecture/phase-4-agent-harness" },
            { label: "Phase 5: Built-in Coding Tools", slug: "architecture/phase-5-coding-tools" },
            { label: "Phase 6: Non-interactive Print-mode CLI", slug: "architecture/phase-6-print-mode-cli" },
            { label: "Phase 7: Session Tree and JSONL Persistence", slug: "architecture/phase-7-session-tree" },
            { label: "Phase 8: Coding Session Wrapper", slug: "architecture/phase-8-coding-session" },
            { label: "Phase 9: Skills and Prompt Templates", slug: "architecture/phase-9-skills-prompts" },
            { label: "Phase 10: System Prompt Assembly", slug: "architecture/phase-10-system-prompt" },
            { label: "Phase 11: Print and Event Rendering Modes", slug: "architecture/phase-11-print-event-rendering" },
            { label: "Phase 12: Textual TUI", slug: "architecture/phase-12-textual-tui" },
            { label: "Phase 13: Tau Home, Paths, and .agents Resources", slug: "architecture/phase-13-paths-agents-resources" },
            { label: "Phase 14: Session Manager and Resume", slug: "architecture/phase-14-session-manager-resume" },
            { label: "Phase 15: Slash Command Registry", slug: "architecture/phase-15-slash-command-registry" },
            { label: "Phase 16: Robust Resource Discovery", slug: "architecture/phase-16-resource-discovery" },
            { label: "Phase 17: TUI Slash-command Autocomplete", slug: "architecture/phase-17-tui-autocomplete" },
            { label: "Phase 17.5: TUI Transcript Wrapping", slug: "architecture/phase-17-5-transcript-wrapping" },
            { label: "Phase 18: Provider Configuration Foundation", slug: "architecture/phase-18-provider-config-foundation" },
            { label: "Phase 19: Project Context Discovery and Reload", slug: "architecture/phase-19-context-discovery" },
            { label: "Phase 20: Installation and Configuration Docs", slug: "architecture/phase-20-installation-docs" },
            { label: "Phase 20.1: Context Accounting Refresh", slug: "architecture/phase-20-1-context-accounting" },
            { label: "Phase 20.2: Thinking Mode Controls", slug: "architecture/phase-20-2-thinking-controls" },
            { label: "Phase 20.3: Skill Invocation Reliability", slug: "architecture/phase-20-3-skill-invocation" },
            { label: "Phase 20.4: Session Export and Visualization", slug: "architecture/phase-20-4-session-export" },
            { label: "Provider Retry Events", slug: "architecture/provider-retries" },
            { label: "Queued Steering and Follow-ups", slug: "architecture/queued-steering-follow-ups" },
            { label: "Pre-extension Hardening Summary", slug: "architecture/pre-extension-hardening" },
            { label: "Phase 22: Compaction Replay Foundation", slug: "architecture/phase-22-compaction-foundation" },
            { label: "Phase 23: Advanced TUI and Product Polish", slug: "architecture/phase-23-tui-polish" },
          ],
        },
        {
          label: "ADRs",
          items: [
            { label: "Use Textual for TUI", slug: "adr/0001-use-textual-for-tui" },
            { label: "Keep Tool Docs Hand-written", slug: "adr/0002-keep-tool-docs-hand-written" },
          ],
        },
      ],
    }),
  ],
});
