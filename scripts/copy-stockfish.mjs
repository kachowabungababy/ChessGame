import { cpSync, mkdirSync } from 'node:fs';

// Copies the prebuilt single-threaded WASM Stockfish engine (from the `stockfish`
// npm devDependency) into public/, where Vite serves it verbatim as a classic
// Worker script. Re-run this after upgrading the `stockfish` package.
mkdirSync('public/stockfish', { recursive: true });
cpSync('node_modules/stockfish/bin/stockfish-18-lite-single.js', 'public/stockfish/stockfish-18-lite-single.js');
cpSync('node_modules/stockfish/bin/stockfish-18-lite-single.wasm', 'public/stockfish/stockfish-18-lite-single.wasm');

console.log('Copied Stockfish engine files to public/stockfish/');
