#!/bin/sh
# The double-clickable copy for the zip: one classic script, no modules, opens from file://.
cd /home/claude/stlu/Stellar-UI-Prototype-main/artifacts/st-lu-prototype \
  && STATIC_PREVIEW=1 VITE_HASH_ROUTER=1 BASE_PATH=./ npx vite build --outDir /home/claude/after-static --emptyOutDir 2>&1 | grep -E "error|built in"
