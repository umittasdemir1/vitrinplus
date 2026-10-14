"""Mevcut mağaza fotoğrafları için görsel parmak izi (imageHashes) üretir.

Uygulama yeni yüklemelerde parmak izini tarayıcıda hesaplar (src/services/imageHash.js).
Bu script, o özellikten önce yüklenmiş fotoğrafları aynı algoritmayla doldurur;
böylece eski fotoğrafların tekrar yüklenmesi de engellenir. İki taraf aynı
algoritmayı kullanmalı: 256x256, 17x16 blok ortalaması, yatay dHash, 256 bit / 64 hex.

Kullanım:  pip install pillow
           python scripts/backfill-image-hashes.py <FIREBASE_WEB_API_KEY> [--dry-run]

Sadece imageHashes alanına arrayUnion ile ekleme yapar; images'a dokunmaz.
"""
import io
import json
import sys
import urllib.parse
import urllib.error
import urllib.request

from PIL import Image

PROJECT = "vitrinplus-91045"
BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents"
W, H = 17, 16


def image_hash(data):
    im = Image.open(io.BytesIO(data)).convert("RGB")
    im = im.resize((256, 256), Image.BILINEAR)
    w, h = im.size
    px = im.load()
    grid = []
    for gy in range(H):
        y0, y1 = gy * h // H, (gy + 1) * h // H
        for gx in range(W):
            x0, x1 = gx * w // W, (gx + 1) * w // W
            total = sum(0.299 * px[x, y][0] + 0.587 * px[x, y][1] + 0.114 * px[x, y][2]
                        for y in range(y0, y1) for x in range(x0, x1))
            grid.append(total / ((y1 - y0) * (x1 - x0)))
    gray = lambda x, y: grid[y * W + x]
    out = ""
    for y in range(H):
        for x in range(0, W - 1, 4):
            nibble = 0
            for b in range(4):
                nibble = (nibble << 1) | (1 if gray(x + b, y) > gray(x + b + 1, y) else 0)
            out += format(nibble, "x")
    return out


def call(url, token, data=None, method=None):
    headers = {"Content-Type": "application/json", "Authorization": "Bearer " + token}
    body = json.dumps(data).encode() if data is not None else None
    try:
        return json.load(urllib.request.urlopen(urllib.request.Request(url, body, headers, method=method)))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{e.code}: {e.read().decode()[:500]}") from None


def main():
    key = sys.argv[1]
    dry = "--dry-run" in sys.argv
    signup = urllib.request.Request(
        f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}",
        json.dumps({"returnSecureToken": True}).encode(), {"Content-Type": "application/json"})
    token = json.load(urllib.request.urlopen(signup))["idToken"]

    docs = call(f"{BASE}/stores?pageSize=300", token).get("documents", [])
    for d in docs:
        fields = d.get("fields", {})
        images = [v.get("stringValue", "") for v in fields.get("images", {}).get("arrayValue", {}).get("values", [])]
        existing = {
            v["mapValue"]["fields"]["url"]["stringValue"]
            for v in fields.get("imageHashes", {}).get("arrayValue", {}).get("values", [])
        }
        entries = []
        for url in images:
            # data: URL'ler (eski, belgeye gömülü görseller) atlanır: url alanına
            # base64 verinin kendisi yazılır ve belge 1 MB sınırını aşar
            if not url or url in existing or url.startswith("data:"):
                continue
            try:
                data = urllib.request.urlopen(url).read()
                entries.append({"url": url, "hash": image_hash(data)})
            except Exception as e:  # kırık link vb.
                print("  atlandı:", url[:80], e)
        if not entries:
            continue
        store_id = d["name"].split("/")[-1]
        print(f"{store_id}: {len(entries)} parmak izi")
        if dry:
            continue
        try:
            commit(d["name"], entries, token)
        except RuntimeError as e:
            print("  YAZILAMADI:", str(e)[:300])


def commit(doc_name, entries, token):
    values = [{"mapValue": {"fields": {"url": {"stringValue": e["url"]}, "hash": {"stringValue": e["hash"]}}}}
              for e in entries]
    call(f"{BASE}:commit", token, {"writes": [{
            "transform": {
                "document": doc_name,
                "fieldTransforms": [{"fieldPath": "imageHashes", "appendMissingElements": {"values": values}}],
            }
        }]}, "POST")


if __name__ == "__main__":
    main()
