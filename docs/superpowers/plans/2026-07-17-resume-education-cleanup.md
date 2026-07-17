# Resume Education Cleanup Implementation Plan

**Goal:** Simplify the education language, add Google Scholar publication evidence, and remove the irrelevant food-safety credential without changing the two-page resume contract.

**Files:** `qa/normalize_candidate_positioning.py`, `qa/test_candidate_positioning.py`, `resume.html`, generated resume PDF.

1. Add deterministic resume replacements to the normalization script.
2. Add source assertions for “STEM,” academic and industrial publications, Google Scholar, and removal of Food Safety Management Certification.
3. Run the existing source, browser, and PDF page-count gates.
4. Merge to main and allow the publication workflow to regenerate the resume PDF.
