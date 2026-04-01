#!/usr/bin/env python3
"""
Refreshes lightweight metadata for data/sources.json URLs.

This script does not scrape or store article bodies. It only records:
- status code
- fetched timestamp
- page title (best-effort)

Usage:
  python scripts/fetch_sources.py
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCES_PATH = REPO_ROOT / "data" / "sources.json"


def extract_title(html_text: str) -> str | None:
    match = re.search(r"<title[^>]*>(.*?)</title>", html_text, re.IGNORECASE | re.DOTALL)
    if not match:
        return None
    title = re.sub(r"\s+", " ", match.group(1)).strip()
    return title or None


def fetch_metadata(url: str) -> dict:
    req = Request(
        url=url,
        headers={
            "User-Agent": "why-claude-code-leaked-metadata-bot/1.0 (+educational security research)"
        },
    )
    fetched_at = datetime.now(timezone.utc).isoformat()

    try:
        with urlopen(req, timeout=15) as response:
            status = getattr(response, "status", 200)
            content_type = response.headers.get("content-type", "")
            body = response.read(180_000).decode("utf-8", errors="ignore")
            return {
                "status": int(status),
                "content_type": content_type,
                "fetched_at": fetched_at,
                "title_fetched": extract_title(body),
                "error": None,
            }
    except HTTPError as err:
        return {
            "status": int(err.code),
            "content_type": "",
            "fetched_at": fetched_at,
            "title_fetched": None,
            "error": f"HTTPError: {err.reason}",
        }
    except URLError as err:
        return {
            "status": None,
            "content_type": "",
            "fetched_at": fetched_at,
            "title_fetched": None,
            "error": f"URLError: {err.reason}",
        }
    except Exception as err:  # pylint: disable=broad-except
        return {
            "status": None,
            "content_type": "",
            "fetched_at": fetched_at,
            "title_fetched": None,
            "error": f"Exception: {err}",
        }


def main() -> None:
    data = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("data/sources.json must be a JSON array.")

    for item in data:
        url = item.get("url")
        if not isinstance(url, str) or not url:
            item["fetch"] = {
                "status": None,
                "content_type": "",
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "title_fetched": None,
                "error": "Missing URL",
            }
            continue
        item["fetch"] = fetch_metadata(url)

    SOURCES_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Updated metadata for {len(data)} sources.")


if __name__ == "__main__":
    main()
