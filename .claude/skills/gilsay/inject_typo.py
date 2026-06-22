#!/usr/bin/env python3
"""
gilsay humanizing-typo injector.

Reads text from stdin, writes it to stdout. If the text is more than 100 words,
it introduces exactly ONE deliberate typo near the 60% mark: a single interior
letter of a word is replaced with a physically-adjacent QWERTY key, producing a
near-miss spelling. Deterministic: same input always yields the same typo.

Usage:
    python3 inject_typo.py < clean_text.txt
"""
import sys
import re

text = sys.stdin.read()

# Gate: texts of 100 words or fewer are left untouched.
if len(text.split()) <= 100:
    sys.stdout.write(text)
    sys.exit(0)

# Left/right QWERTY neighbours (lowercase). One swap = a plausible finger slip.
ADJ = {
    'q': 'w', 'w': 'e', 'e': 'r', 'r': 't', 't': 'y', 'y': 'u',
    'u': 'i', 'i': 'o', 'o': 'p', 'p': 'o',
    'a': 's', 's': 'd', 'd': 'f', 'f': 'g', 'g': 'h', 'h': 'j',
    'j': 'k', 'k': 'l', 'l': 'k',
    'z': 'x', 'x': 'c', 'c': 'v', 'v': 'b', 'b': 'n', 'n': 'm', 'm': 'n',
}

L = len(text)

# Candidate words: alphabetic, length >= 4 (long enough to hide a slip).
tokens = list(re.finditer(r"[A-Za-z]{4,}", text))

# Prefer a word whose midpoint sits in the 55%-65% band; else nearest to 60%.
def frac(m):
    return ((m.start() + m.end()) / 2) / L

band = [m for m in tokens if 0.55 <= frac(m) <= 0.65]
pool = band if band else tokens

if not pool:
    sys.stdout.write(text)
    sys.exit(0)

m = min(pool, key=lambda m: abs(frac(m) - 0.60))
word = m.group()

# Swap the first interior letter (never the first character) that has a neighbour.
idx = next((i for i in range(1, len(word)) if word[i].lower() in ADJ), None)
if idx is None:
    sys.stdout.write(text)
    sys.exit(0)

repl = ADJ[word[idx].lower()]
if word[idx].isupper():
    repl = repl.upper()

typoed = word[:idx] + repl + word[idx + 1:]
sys.stdout.write(text[:m.start()] + typoed + text[m.end():])
