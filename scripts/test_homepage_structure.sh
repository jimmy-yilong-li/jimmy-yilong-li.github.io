#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/homepage-build.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT

cd "$ROOT_DIR"

bundle exec jekyll build --destination "$BUILD_DIR" >/dev/null

INDEX_HTML="$BUILD_DIR/index.html"
PUBLICATIONS_HTML="$BUILD_DIR/publications/index.html"
FAVICON_FILE="$BUILD_DIR/favicon.ico"
NORMALIZED_INDEX="$BUILD_DIR/index.normalized.txt"
NORMALIZED_PUBLICATIONS="$BUILD_DIR/publications.normalized.txt"

if [[ ! -f "$INDEX_HTML" ]]; then
  echo "FAIL: generated homepage not found at $INDEX_HTML" >&2
  exit 1
fi

if [[ ! -f "$FAVICON_FILE" ]]; then
  echo "FAIL: generated favicon not found at $FAVICON_FILE" >&2
  exit 1
fi

tr '\n' ' ' <"$INDEX_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_INDEX"

if [[ ! -f "$PUBLICATIONS_HTML" ]]; then
  echo "FAIL: generated publications page not found at $PUBLICATIONS_HTML" >&2
  exit 1
fi

tr '\n' ' ' <"$PUBLICATIONS_HTML" | tr -s '[:space:]' ' ' >"$NORMALIZED_PUBLICATIONS"

assert_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_INDEX"; then
    echo "FAIL: expected homepage to contain: $needle" >&2
    exit 1
  fi
}

assert_publications_contains() {
  local needle="$1"

  if ! grep -Fq -- "$needle" "$NORMALIZED_PUBLICATIONS"; then
    echo "FAIL: expected publications page to contain: $needle" >&2
    exit 1
  fi
}

assert_contains "News / Updates"
assert_contains "Ongoing Research"
assert_contains "Selected Publications"
assert_contains "Google Scholar"
assert_contains "favicon.ico"
assert_contains "on-device AI, human sensing, and agentic memory"
assert_contains "StoreAgent"
assert_contains "memory policy"
assert_contains "task solver"
assert_contains "Virgile: A Multimodal Visual Memory Assistant"
assert_contains "LiveTag: Sensing Human-Object Interaction through Passive Chipless WiFi Tags"
assert_contains "href=\"/publications/\""

assert_publications_contains ">Publications<"
assert_publications_contains "Journal Papers"
assert_publications_contains "Conference Papers"
assert_publications_contains "Enabling Wideband, Mobile Spectrum Sensing through Onboard Heterogeneous Computing"
assert_publications_contains "Tiny but Mighty: A Software-Hardware Co-Design Approach for Efficient Multimodal Inference on Battery-Powered Small Devices"
assert_publications_contains "Split to Fit: Cross-Accelerator Hybrid Quantization for Efficient Video Understanding on Edge Systems"
assert_publications_contains "Sustainable Spectrum Crowdsensing"
assert_publications_contains "IEEE Transactions on Networking (ToN) 2026"
assert_publications_contains "Journal version"
assert_publications_contains "IEEE DySPAN 2024"
assert_publications_contains "Conference version"
assert_publications_contains "GetMobile 2018"
assert_publications_contains "NSDI 2018"

if grep -Fq -- "href=\"\"" "$NORMALIZED_PUBLICATIONS"; then
  echo "FAIL: publications page should not render empty links" >&2
  exit 1
fi

conference_pos="$(grep -b -o "Conference Papers" "$NORMALIZED_PUBLICATIONS" | head -n 1 | cut -d: -f1)"
journal_pos="$(grep -b -o "Journal Papers" "$NORMALIZED_PUBLICATIONS" | head -n 1 | cut -d: -f1)"
if [[ -z "$conference_pos" || -z "$journal_pos" || "$conference_pos" -gt "$journal_pos" ]]; then
  echo "FAIL: Conference Papers should appear before Journal Papers" >&2
  exit 1
fi

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

if grep -Fq -- "CRANE: Compiled Runtime for Apple Neural Engine" "$NORMALIZED_INDEX"; then
  echo "FAIL: homepage project section should not contain CRANE with a mismatched image" >&2
  exit 1
fi

echo "PASS: homepage contains the expected structure markers"
