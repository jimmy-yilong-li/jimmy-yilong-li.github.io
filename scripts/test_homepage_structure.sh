#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/homepage-build.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT

cd "$ROOT_DIR"

bundle exec jekyll build --destination "$BUILD_DIR" >/dev/null

INDEX_HTML="$BUILD_DIR/index.html"
PUBLICATIONS_HTML="$BUILD_DIR/publications/index.html"
PROJECTS_HTML="$BUILD_DIR/projects/index.html"
BLOG_HTML="$BUILD_DIR/blog/index.html"
ACCELERATOR_POST_HTML="$BUILD_DIR/what-we-learned-the-hard-way-about-npus-gpus-and-unified-memory/index.html"
MEDUSA_PAPER_HTML="$BUILD_DIR/papers/2025-12-09-Medusa/index.html"
FAVICON_FILE="$BUILD_DIR/favicon.ico"
EMBER_PDF_FILE="$BUILD_DIR/pdfs/EMBER_Li.pdf"
KNOWING_PDF_FILE="$BUILD_DIR/pdfs/knowing.pdf"
REMIND_SLIDES_FILE="$BUILD_DIR/pdfs/Re-Mind_for_pitch.pdf"
MMPUPIL_IMAGE_FILE="$BUILD_DIR/images/mmpupil-system.png"
NORMALIZED_INDEX="$BUILD_DIR/index.normalized.txt"
NORMALIZED_PUBLICATIONS="$BUILD_DIR/publications.normalized.txt"
NORMALIZED_PROJECTS="$BUILD_DIR/projects.normalized.txt"
NORMALIZED_BLOG="$BUILD_DIR/blog.normalized.txt"
NORMALIZED_ACCELERATOR_POST="$BUILD_DIR/accelerator-post.normalized.txt"
NORMALIZED_MEDUSA_PAPER="$BUILD_DIR/medusa-paper.normalized.txt"

if [[ ! -f "$INDEX_HTML" ]]; then
  echo "FAIL: generated homepage not found at $INDEX_HTML" >&2
  exit 1
fi

if [[ ! -f "$FAVICON_FILE" ]]; then
  echo "FAIL: generated favicon not found at $FAVICON_FILE" >&2
  exit 1
fi

if [[ ! -f "$EMBER_PDF_FILE" ]]; then
  echo "FAIL: generated EMBER PDF not found at $EMBER_PDF_FILE" >&2
  exit 1
fi

if [[ ! -f "$KNOWING_PDF_FILE" ]]; then
  echo "FAIL: generated Knowing PDF not found at $KNOWING_PDF_FILE" >&2
  exit 1
fi

if [[ ! -f "$REMIND_SLIDES_FILE" ]]; then
  echo "FAIL: generated Re-Mind slides not found at $REMIND_SLIDES_FILE" >&2
  exit 1
fi

if [[ ! -f "$MMPUPIL_IMAGE_FILE" ]]; then
  echo "FAIL: generated mmPupil project image not found at $MMPUPIL_IMAGE_FILE" >&2
  exit 1
fi

tr '\n' ' ' <"$INDEX_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_INDEX"

if [[ ! -f "$PUBLICATIONS_HTML" ]]; then
  echo "FAIL: generated publications page not found at $PUBLICATIONS_HTML" >&2
  exit 1
fi

tr '\n' ' ' <"$PUBLICATIONS_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_PUBLICATIONS"

if [[ ! -f "$PROJECTS_HTML" ]]; then
  echo "FAIL: generated projects page not found at $PROJECTS_HTML" >&2
  exit 1
fi

tr '\n' ' ' <"$PROJECTS_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_PROJECTS"

if [[ ! -f "$BLOG_HTML" ]]; then
  echo "FAIL: generated blog page not found at $BLOG_HTML" >&2
  exit 1
fi

tr '\n' ' ' <"$BLOG_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_BLOG"

if [[ ! -f "$ACCELERATOR_POST_HTML" ]]; then
  echo "FAIL: generated accelerator blog post not found at $ACCELERATOR_POST_HTML" >&2
  exit 1
fi

tr '\n' ' ' <"$ACCELERATOR_POST_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_ACCELERATOR_POST"

if [[ ! -f "$MEDUSA_PAPER_HTML" ]]; then
  echo "FAIL: generated MEDUSA paper page not found at $MEDUSA_PAPER_HTML" >&2
  exit 1
fi

tr '\n' ' ' <"$MEDUSA_PAPER_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_MEDUSA_PAPER"

assert_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_INDEX"; then
    echo "FAIL: expected homepage to contain: $needle" >&2
    exit 1
  fi
}

assert_publication_article_contains() {
  local html="$1"
  local article_open="$2"
  local context="$3"
  local marker="$4"
  shift 4

  local remaining
  local article
  local article_body
  local needle

  remaining="$html"

  while [[ "$remaining" == *"$article_open"* ]]; do
    remaining="${remaining#*"$article_open"}"
    article_body="${remaining%%"</article>"*}"

    if [[ "$article_body" == *"$article_open"* ]]; then
      echo "FAIL: malformed $context HTML: found another publication article before closing </article>" >&2
      exit 1
    fi

    if [[ "$remaining" != *"</article>"* ]]; then
      echo "FAIL: malformed $context HTML: publication article is missing </article>" >&2
      exit 1
    fi

    article="$article_open$article_body</article>"

    if [[ "$article" == *"$marker"* ]]; then
      for needle in "$@"; do
        if [[ "$article" != *"$needle"* ]]; then
          echo "FAIL: expected $context containing '$marker' to contain: $needle" >&2
          exit 1
        fi
      done
      return
    fi

    remaining="${remaining#*"</article>"}"
  done

  echo "FAIL: $context not found for marker: $marker" >&2
  exit 1
}

assert_section_publication_contains() {
  local html="$1"
  local section_prefix="$2"
  local article_open="$3"
  local context="$4"
  shift 4

  local remaining
  local section_open
  local section

  remaining="$html"

  if [[ "$remaining" != *"$section_prefix"* ]]; then
    echo "FAIL: $context not found" >&2
    exit 1
  fi

  remaining="${remaining#*"$section_prefix"}"

  if [[ "$remaining" != *">"* ]]; then
    echo "FAIL: malformed $context HTML: section opening tag is missing >" >&2
    exit 1
  fi

  section_open="$section_prefix${remaining%%">"*}>"
  remaining="${remaining#*">"}"

  if [[ "$remaining" != *"</section>"* ]]; then
    echo "FAIL: malformed $context HTML: section is missing </section>" >&2
    exit 1
  fi

  section="$section_open${remaining%%"</section>"*}</section>"

  assert_publication_article_contains \
    "$section" \
    "$article_open" \
    "$context publication" \
    "$@"
}

assert_homepage_publication_contains() {
  local article_open='<article class="publication-item publication-entry">'

  assert_section_publication_contains \
    "$(<"$NORMALIZED_INDEX")" \
    '<section id="publications"' \
    "$article_open" \
    "homepage publications section" \
    "$@"
}

assert_publications_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_PUBLICATIONS"; then
    echo "FAIL: expected publications page to contain: $needle" >&2
    exit 1
  fi
}

assert_publications_section_publication_contains() {
  local section_id="$1"
  shift

  local article_open='<article class="publication-page-item publication-entry">'

  assert_section_publication_contains \
    "$(<"$NORMALIZED_PUBLICATIONS")" \
    "<section class=\"publication-section-group\" aria-labelledby=\"$section_id\"" \
    "$article_open" \
    "publications section '$section_id'" \
    "$@"
}

assert_projects_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_PROJECTS"; then
    echo "FAIL: expected projects page to contain: $needle" >&2
    exit 1
  fi
}

assert_blog_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_BLOG"; then
    echo "FAIL: expected blog page to contain: $needle" >&2
    exit 1
  fi
}

assert_accelerator_post_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_ACCELERATOR_POST"; then
    echo "FAIL: expected accelerator blog post to contain: $needle" >&2
    exit 1
  fi
}

assert_medusa_paper_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_MEDUSA_PAPER"; then
    echo "FAIL: expected MEDUSA paper page to contain: $needle" >&2
    exit 1
  fi
}

assert_contains "News / Updates"
assert_contains "Research Projects"
assert_contains "Selected Publications"
assert_contains "Google Scholar"
assert_contains "Re-Mind"
assert_contains "real-world episodic memory"
assert_contains "href=\"/pdfs/Re-Mind_for_pitch.pdf\">Re-Mind Slides"
assert_contains "favicon.ico"
assert_contains "systems researcher building hardware, software, and models"
assert_contains "efficient LLM inference, RL post-training, and wireless systems"
assert_contains "obtained my Ph.D. from the University of Wisconsin-Madison"
assert_contains "href=\"https://pages.cs.wisc.edu/~suman/\""
assert_contains "Prof. Suman Banerjee"
assert_contains "spent several years building MIMO radar systems"
assert_contains "real-world indoor and hospital settings"
assert_contains "NEC Laboratories America"
assert_contains "Dr. Eugene Chai"
assert_contains "Dr. Karthikeyan Sundaresan"
assert_contains "Meta Reality Labs"
assert_contains "silicon and ML accelerator development for wearable devices"
assert_contains "multimodal contextual AI pipeline"
assert_contains "sensing hardware, silicon, runtimes, models, and deployment constraints"
assert_contains "The shift from frontier AI models to smaller, deployable AI systems"
assert_contains "AI must not be locked inside corporate black boxes. Free intelligence that people themselves can run, study, modify, reproduce, share, and trust."
assert_contains "<blockquote class=\"hero-slogan\">"
assert_contains "Three current research lines"
assert_contains "<p class=\"project-kicker\">RL Finetuning for Small Models</p>"
assert_contains "<p class=\"project-kicker\">Wireless Human Sensing</p>"
assert_contains "<p class=\"project-kicker\">On-Device AI</p>"
assert_contains "mmPupil"
assert_contains "Virgile / NanoMind"
assert_contains "EMBER"
assert_contains "Cast a Wider Net: Coordinated Pass@K Policy Optimization for Code Reasoning"
assert_contains "CPPO was accepted to EMNLP 2026"
assert_contains "<strong class=\"publication-venue\">EMNLP 2026</strong>"
assert_homepage_publication_contains \
  'href="/papers/2026-09-28-knowing/">Details' \
  "Knowing Is Not Choosing: What Explicit Verification Adds Beyond Generative Preference" \
  "<strong>Yilong Li</strong>, Chengpo Yan, Aayan Arish, Suman Banerjee" \
  "<strong class=\"publication-venue\">arXiv preprint, 2026</strong>" \
  'href="/pdfs/knowing.pdf">PDF'
assert_contains "publication-entry"
assert_contains "<strong class=\"publication-venue\">MobiCom 2025</strong>"
assert_contains "CRANE is now open-sourced for direct Apple Neural Engine inference without Core ML."
assert_contains "MEDUSA repo is here!"
assert_contains "href=\"https://github.com/JimmyLi-Network/Medusa_UWB_MIMO\">MEDUSA repo is here!"
assert_contains "href=\"https://github.com/JimmyLi-Network/Medusa_UWB_MIMO\">Code"
assert_contains "LiveTag: Sensing Human-Object Interaction through Passive Chipless WiFi Tags"
assert_contains "href=\"/publications/\""
assert_contains "href=\"/projects/\""
assert_contains "href=\"/blog/\""

if grep -Fq -- "pursuing my Ph.D." "$NORMALIZED_INDEX"; then
  echo "FAIL: homepage bio should describe the Ph.D. as completed" >&2
  exit 1
fi

hero_statement_count="$(awk -F'class=\"hero-statement\"' '{count += NF - 1} END {print count}' "$NORMALIZED_INDEX")"
if [[ "$hero_statement_count" -ne 2 ]]; then
  echo "FAIL: homepage bio should contain two distinct hero statement paragraphs, found $hero_statement_count" >&2
  exit 1
fi

selected_publications_pos="$(grep -b -o "Selected Publications" "$NORMALIZED_INDEX" | head -n 1 | cut -d: -f1)"
research_projects_pos="$(grep -b -o "Research Projects" "$NORMALIZED_INDEX" | head -n 1 | cut -d: -f1)"
if [[ -z "$selected_publications_pos" || -z "$research_projects_pos" || "$selected_publications_pos" -gt "$research_projects_pos" ]]; then
  echo "FAIL: Selected Publications should appear before Research Projects on the homepage" >&2
  exit 1
fi

remind_slides_pos="$(grep -b -o "Re-Mind Slides" "$NORMALIZED_INDEX" | head -n 1 | cut -d: -f1)"
slogan_pos="$(grep -b -o "<blockquote class=\"hero-slogan\">" "$NORMALIZED_INDEX" | head -n 1 | cut -d: -f1)"
hero_links_pos="$(grep -b -o "<div class=\"hero-links\">" "$NORMALIZED_INDEX" | head -n 1 | cut -d: -f1)"
if [[ -z "$remind_slides_pos" || -z "$slogan_pos" || -z "$hero_links_pos" || "$remind_slides_pos" -gt "$slogan_pos" || "$slogan_pos" -gt "$hero_links_pos" ]]; then
  echo "FAIL: homepage slogan should appear as a quote box at the bottom of the bio before profile links" >&2
  exit 1
fi

if grep -Fq -- "publication-image" "$NORMALIZED_INDEX"; then
  echo "FAIL: selected publications should not render thumbnail images on the homepage" >&2
  exit 1
fi

if grep -Fq -- "publication-item--text-only" "$NORMALIZED_INDEX" "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: publications should render as plain list entries, not boxed publication cards" >&2
  exit 1
fi

assert_projects_contains ">Projects<"
assert_projects_contains "RL Finetuning for Small Models"
assert_projects_contains "Wireless Human Sensing"
assert_projects_contains "On-Device AI"
assert_projects_contains "mmPupil"
assert_projects_contains "images/mmpupil-system.png"
assert_projects_contains "CRANE"
assert_projects_contains "NanoMind"
assert_projects_contains "Virgile"
assert_projects_contains "EMBER"
assert_projects_contains "CPPO"
assert_projects_contains "MEDUSA"

if grep -Fq -- "mmPupil.pdf" "$NORMALIZED_INDEX" "$NORMALIZED_PROJECTS"; then
  echo "FAIL: mmPupil draft PDF should not be linked from public pages while under review" >&2
  exit 1
fi

assert_blog_contains ">Blog<"
assert_blog_contains "Technical Writing"
assert_blog_contains "Technical posts, research notes, and short guides"
assert_blog_contains "What We Learned the Hard Way About NPUs, GPUs, and Unified Memory"
assert_blog_contains "href=\"/what-we-learned-the-hard-way-about-npus-gpus-and-unified-memory/\""
assert_blog_contains "NPUs like stable graphs, GPUs need enough parallel work, and shared memory is still shared."

blog_item_count="$(awk -F'class=\"blog-item\"' '{count += NF - 1} END {print count}' "$NORMALIZED_BLOG")"
if [[ "$blog_item_count" -ne 1 ]]; then
  echo "FAIL: blog page should list exactly one finished article, found $blog_item_count" >&2
  exit 1
fi

if grep -Fq -- "Building On-Device AI Systems from Hardware to Software" "$NORMALIZED_BLOG" \
  || grep -Fq -- "RL Post-Training for Efficient Edge AI" "$NORMALIZED_BLOG" \
  || grep -Fq -- "Wireless Sensing Systems in the Wild" "$NORMALIZED_BLOG" \
  || grep -Fq -- "Re-Mind Project Pitch Deck" "$NORMALIZED_BLOG" \
  || grep -Fq -- "href=\"/pdfs/Re-Mind_for_pitch.pdf\"" "$NORMALIZED_BLOG"; then
  echo "FAIL: blog page should list only the finished accelerator article" >&2
  exit 1
fi

assert_accelerator_post_contains "Back to Blog"
assert_accelerator_post_contains "Systems Note"
assert_accelerator_post_contains "A quick note on the numbers: they are rounded from what we observed in our experiments."
assert_accelerator_post_contains "The trend matters more than the exact value."
assert_accelerator_post_contains "An edge SoC is not a smaller datacenter GPU."
assert_accelerator_post_contains "Unified memory makes handoff cheap; it does not make concurrent memory traffic free."
assert_accelerator_post_contains "optimize complete token time"
assert_accelerator_post_contains "Embeddings travel well."
assert_accelerator_post_contains "KV caches"

if grep -Fq -- "EdgeFlow" "$NORMALIZED_BLOG" "$NORMALIZED_ACCELERATOR_POST"; then
  echo "FAIL: the unpublished project name should not appear in the public Blog" >&2
  exit 1
fi

if grep -Fq -- "unpublished internal experiments" "$NORMALIZED_ACCELERATOR_POST" \
  || grep -Fq -- "benchmark claims" "$NORMALIZED_ACCELERATOR_POST"; then
  echo "FAIL: the Blog should describe experimental observations conversationally" >&2
  exit 1
fi

assert_publications_contains ">Publications<"
assert_publications_contains "Efficient AI / Agentic AI / Interpretability"
assert_publications_contains "On-Device AI"
assert_publications_contains "Wireless Sensing"
assert_publications_contains "publication-page-item publication-entry"
assert_publications_section_publication_contains \
  "efficient-ai-agentic-ai-interpretability" \
  'href="/papers/2026-09-28-knowing/">Details' \
  "Knowing Is Not Choosing: What Explicit Verification Adds Beyond Generative Preference" \
  "<strong>Yilong Li</strong>, Chengpo Yan, Aayan Arish, Suman Banerjee" \
  "<strong class=\"publication-venue\">arXiv preprint, 2026</strong>" \
  'href="/pdfs/knowing.pdf">PDF'
assert_publications_section_publication_contains \
  "efficient-ai-agentic-ai-interpretability" \
  'href="/papers/2026-05-26-cppo/">Details' \
  "Cast a Wider Net: Coordinated Pass@K Policy Optimization for Code Reasoning"
assert_publications_section_publication_contains \
  "efficient-ai-agentic-ai-interpretability" \
  'href="/papers/2026-05-07-ember/">Details' \
  "EMBER: Efficient Memory via Budgeted Evidence Retention for Long-Horizon Agents"
assert_publications_contains "Cast a Wider Net: Coordinated Pass@K Policy Optimization for Code Reasoning"
assert_publications_contains "Coordinated Pass@K Policy Optimization"
assert_publications_contains "<strong class=\"publication-venue\">EMNLP 2026</strong>"
assert_publications_contains "<strong class=\"publication-venue\">MobiCom 2025</strong>"
assert_publications_contains "href=\"https://arxiv.org/abs/2605.27000\">arXiv"
assert_publications_contains "href=\"https://arxiv.org/pdf/2605.27000\">PDF"
assert_publications_contains "EMBER: Efficient Memory via Budgeted Evidence Retention for Long-Horizon Agents"
assert_publications_contains "<strong>Yilong Li</strong>, Suman Banerjee, Tong Che"
assert_publications_contains "arXiv preprint, 2026"
assert_publications_contains "arXiv"
assert_publications_contains "href=\"/pdfs/EMBER_Li.pdf\">PDF"
assert_publications_contains "Enabling Wideband, Mobile Spectrum Sensing through Onboard Heterogeneous Computing"
assert_publications_contains "Tiny but Mighty: A Software-Hardware Co-Design Approach for Efficient Multimodal Inference on Battery-Powered Small Devices"
assert_publications_contains "Sustainable Spectrum Crowdsensing"
assert_publications_contains "IEEE Transactions on Networking (ToN) 2026"
assert_publications_contains "Journal version"
assert_publications_contains "IEEE DySPAN 2024"
assert_publications_contains "Conference version"
assert_publications_contains "GetMobile 2018"
assert_publications_contains "NSDI 2018"
assert_publications_contains "href=\"https://github.com/JimmyLi-Network/Medusa_UWB_MIMO\">Code"

assert_medusa_paper_contains "<strong class=\"publication-venue\">MobiCom 2025</strong>"

if grep -Fq -- "href=\"\"" "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: publications page should not render empty links" >&2
  exit 1
fi

if grep -Fq -- "et al." "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: publications page should list full authors instead of et al." >&2
  exit 1
fi

if grep -Fq -- "Split to Fit: Cross-Accelerator Hybrid Quantization for Efficient Video Understanding on Edge Systems" "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: Split to Fit should stay hidden until publication" >&2
  exit 1
fi

if grep -Fq -- "Submitted" "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: hidden submitted papers should not appear in publications" >&2
  exit 1
fi

if grep -Fq -- "In Submission" "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: EMBER should be listed as an arXiv preprint, not In Submission" >&2
  exit 1
fi

efficient_agentic_heading='<h2 class="publication-section-heading" id="efficient-ai-agentic-ai-interpretability">Efficient AI / Agentic AI / Interpretability</h2>'
on_device_heading='<h2 class="publication-section-heading" id="on-device-ai">On-Device AI</h2>'
wireless_heading='<h2 class="publication-section-heading" id="wireless-sensing">Wireless Sensing</h2>'

heading_position() {
  local heading="$1"

  grep -F -b -o -- "$heading" "$NORMALIZED_PUBLICATIONS" | head -n 1 | cut -d: -f1 || true
}

efficient_agentic_pos="$(heading_position "$efficient_agentic_heading")"
on_device_pos="$(heading_position "$on_device_heading")"
wireless_pos="$(heading_position "$wireless_heading")"
if [[ -z "$efficient_agentic_pos" || -z "$on_device_pos" || -z "$wireless_pos" || "$efficient_agentic_pos" -gt "$on_device_pos" || "$on_device_pos" -gt "$wireless_pos" ]]; then
  echo "FAIL: publication areas should appear as Efficient AI / Agentic AI / Interpretability, On-Device AI, then Wireless Sensing" >&2
  exit 1
fi

for retired_heading in \
  '<h2 class="publication-section-heading" id="ai-interpretability">AI Interpretability</h2>' \
  '<h2 class="publication-section-heading" id="agentic-ai-for-small-llms">Agentic AI for Small LLMs</h2>'; do
  if grep -Fq -- "$retired_heading" "$NORMALIZED_PUBLICATIONS"; then
    echo "FAIL: retired publication heading should not be rendered: $retired_heading" >&2
    exit 1
  fi
done

for old_publication in \
  "A Qi Wireless Charging Based System for Robust User-Initiated Indoor Location Services" \
  "AirCloud: A Cloud-based Air-Quality Monitoring System for Everyone" \
  "QiLoc" \
  "SECON 2015" \
  "SenSys 2014" \
  "BuildSys 2014"; do
  if grep -Fq -- "$old_publication" "$NORMALIZED_PUBLICATIONS"; then
    echo "FAIL: publications page should not include pre-2016 item: $old_publication" >&2
    exit 1
  fi
done

if grep -Fq -- "HotMobile 2021" "$NORMALIZED_INDEX"; then
  echo "FAIL: homepage should not feature HotMobile 2021 in selected publications" >&2
  exit 1
fi

if grep -Fq -- "on-device AI for wearable platforms" "$NORMALIZED_INDEX"; then
  echo "FAIL: homepage should not frame the bio around on-device AI for wearable platforms" >&2
  exit 1
fi

if grep -Fq -- "on-device AI, human sensing, and agentic memory" "$NORMALIZED_INDEX"; then
  echo "FAIL: homepage bio should use the updated systems-research framing" >&2
  exit 1
fi

if grep -Fq -- "CRANE: Compiled Runtime for Apple Neural Engine" "$NORMALIZED_INDEX"; then
  echo "FAIL: homepage project section should not contain CRANE with a mismatched image" >&2
  exit 1
fi

for old_project_label in \
  "Theme 01" \
  "Theme 02" \
  "Theme 03" \
  "Hardware + Software" \
  "Efficient Edge AI" \
  "Learning Under Constraints" \
  "Medusa Wireless Sensing" \
  "Wireless Sensing" \
  "ML Systems" \
  "LLM Post-Training" \
  "ML Sys / EdgeFlow" \
  "LLM RL Fine-Tuning" \
  "EdgeFlow / CRANE" \
  "EMBER / CPPO" \
  "Split to Fit / CRANE" \
  "EMBER / StoreAgent" \
  "MEDUSA / Gemini"; do
  if grep -Fq -- "$old_project_label" "$NORMALIZED_INDEX"; then
    echo "FAIL: homepage should not use old mixed project label: $old_project_label" >&2
    exit 1
  fi
done

if grep -Fq -- "compiles MIL programs with baked weights" "$NORMALIZED_INDEX"; then
  echo "FAIL: CRANE news should stay concise on the homepage" >&2
  exit 1
fi

if grep -Fq -- "MEDUSA code was open-sourced" "$NORMALIZED_INDEX"; then
  echo "FAIL: MEDUSA news should use the requested repo announcement title" >&2
  exit 1
fi

if grep -Fq -- "MEDUSA repo is here!https://" "$NORMALIZED_INDEX"; then
  echo "FAIL: MEDUSA news title should not concatenate the GitHub URL" >&2
  exit 1
fi

for blog_only_item in \
  "Building On-Device AI Systems from Hardware to Software" \
  "RL Post-Training for Efficient Edge AI" \
  "Wireless Sensing Systems in the Wild"; do
  if grep -Fq -- "$blog_only_item" "$NORMALIZED_INDEX"; then
    echo "FAIL: blog notes should not be rendered on the homepage: $blog_only_item" >&2
    exit 1
  fi
done

echo "PASS: homepage contains the expected structure markers"
