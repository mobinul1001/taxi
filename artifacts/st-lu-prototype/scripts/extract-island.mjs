import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
const fc = feature(topo, topo.objects.countries);
const f = fc.features.find((x) => /saint lucia/i.test(x.properties?.name ?? ""));
if (!f) { console.error("not found", fc.features.map(x=>x.properties?.name).filter(n=>/lucia|vincent/i.test(n))); process.exit(1); }
const round = (c) => Array.isArray(c[0]) ? c.map(round) : [Number(c[0].toFixed(5)), Number(c[1].toFixed(5))];
const geom = { type: f.geometry.type, coordinates: round(f.geometry.coordinates) };
let n = 0; const count = (c) => Array.isArray(c[0]) ? c.forEach(count) : n++;
count(geom.coordinates);
console.log(f.properties.name, geom.type, "points:", n, JSON.stringify(geom).length, "bytes");
writeFileSync("/tmp/stlucia.json", JSON.stringify(geom));
