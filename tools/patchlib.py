import re
import os
P=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test')
def load(): return open(P).read()
def save(s): open(P,'w').write(s)
def rep(s,a,b,n=1):
    assert s.count(a)==n, (s.count(a), a[:100]); return s.replace(a,b)
def panel_span(s, n):
    key = "  P[%s] = function (ctx) {" % n
    i = s.index(key)
    j = s.index("\n", i)
    line = s[i:j]
    if line.rstrip().endswith("};"):
        return i, j + 1
    k = s.index("\n  };\n", i) + len("\n  };\n")
    return i, k
def set_panel(s, n, code):
    i, j = panel_span(s, n)
    body = s[i:j]
    assert "\n  P[" not in body[1:], "span crosses into another panel"
    return s[:i] + code.rstrip("\n") + "\n" + s[j:]
