#!/bin/sh
# The hosted build: ES modules, split chunks, a real stylesheet link. This is what the artifact
# serves and what the client opens, so it is also what the gates test (over http, not file://).
cd /home/claude/stlu/Stellar-UI-Prototype-main/artifacts/st-lu-prototype \
  && npx tsc -p tsconfig.json --noEmit \
  && VITE_HASH_ROUTER=1 BASE_PATH=./ npx vite build --outDir /home/claude/after --emptyOutDir 2>&1 | grep -E "error|built in"
