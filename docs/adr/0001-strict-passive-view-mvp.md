# 0001. Strict Passive View MVP Architecture

We adopt a strict Passive View Model-View-Presenter (MVP) architecture across all pages: Presenters receive their View and Model dependencies via constructor injection, hold zero direct references to DOM APIs (`document`, `window`, Leaflet, or `MediaStream`), and communicate exclusively through View interface methods. This guarantees compliance with Dicoding's Kriteria 1 Advance rubric while allowing every Presenter flow to be unit-tested deterministically in Vitest without a heavy browser environment.
