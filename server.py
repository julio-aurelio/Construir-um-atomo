"""Servidor do jogo Monte um Átomo. Rode: python server.py  ->  http://localhost:8000"""
import json
import urllib.request
from functools import lru_cache
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PUBCHEM = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON"


@lru_cache(maxsize=1)
def elementos():
    """Baixa a tabela periódica da PubChem uma vez e devolve só o que o jogo usa."""
    with urllib.request.urlopen(PUBCHEM, timeout=20) as r:
        tabela = json.load(r)["Table"]
    cols = tabela["Columns"]["Column"]
    out = []
    for row in tabela["Row"]:
        d = dict(zip(cols, row["Cell"]))
        out.append({
            "z": int(d["AtomicNumber"]),
            "simbolo": d["Symbol"],
            "nome_en": d["Name"],
            "massa": float(d["AtomicMass"].split("(")[0] or 0),
            "grupo": d["GroupBlock"],
            "cor": d["CPKHexColor"] or "909090",
        })
    return json.dumps(out).encode()


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/api/elementos":
            return super().do_GET()
        try:
            body, code = elementos(), 200
        except Exception as e:  # PubChem fora do ar
            body, code = json.dumps({"erro": str(e)}).encode(), 502
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print("Jogo em http://localhost:8000")
    ThreadingHTTPServer(("", 8000), Handler).serve_forever()
