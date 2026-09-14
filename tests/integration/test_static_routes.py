"""
Integration tests for the static / document routes served by `serve_spa`.

This route had no test coverage at all, which is how a `500` on every reference
document shipped to Cloud Run. The handler called `get_authenticated_user` --
a plain `def` -- with `await`, raising `TypeError: object dict can't be used in
'await' expression`. Only the five filenames in `DOCUMENT_FILENAMES` take that
branch, so the SPA and the whole API were unaffected and nothing else noticed.
"""
import pytest
from starlette.testclient import TestClient

import main
from main import app, DOCUMENT_FILENAMES

# `raise_server_exceptions=False` makes the client behave like a real
# deployment: an unhandled exception becomes a 500 response rather than
# propagating into the test. Without it this suite would report the underlying
# TypeError instead of the status code a user actually sees.
client = TestClient(app, raise_server_exceptions=False)


@pytest.mark.parametrize("filename", sorted(DOCUMENT_FILENAMES))
def test_reference_documents_are_served(filename: str):
    """Every document the Admin Panel links to must actually load.

    Parameterized over `DOCUMENT_FILENAMES` rather than a hand-written list, so
    a document added to the set without a corresponding file on disk fails here
    instead of in front of an audience.
    """
    resp = client.get(f"/{filename}")

    assert resp.status_code == 200, (
        f"{filename} returned {resp.status_code}. The Admin Panel links to this "
        f"file; a non-200 here is a dead link in the demo."
    )
    assert resp.headers["content-type"].startswith("text/html")
    # A real document, not an empty file or the SPA shell served as a fallback.
    assert len(resp.content) > 5000
    assert b"<html" in resp.content.lower()


@pytest.mark.parametrize("filename", sorted(DOCUMENT_FILENAMES))
def test_reference_documents_are_not_the_spa_shell(filename: str):
    """A missing document must 404 or error -- never silently serve index.html.

    The SPA fallback returns `index.html` for unknown paths. If a document file
    went missing, that fallback would hand back the React shell with a 200 and
    the failure would look like a blank page rather than a broken link.
    """
    resp = client.get(f"/{filename}")
    spa_shell = client.get("/").content

    assert resp.content != spa_shell, (
        f"{filename} is being served by the SPA fallback, which means the file "
        f"itself is not present where the handler looks for it."
    )


def test_document_routes_consult_the_auth_gate(monkeypatch):
    """The documents sit behind IAP, and the handler must actually check.

    Asserting the 200 alone would pass if the auth call were deleted outright,
    so this replaces the gate with one that refuses and confirms the refusal
    reaches the response. The SPA root is checked in the same breath to show the
    gate is scoped to documents rather than applied to everything.
    """
    class Refused(Exception):
        pass

    def refuse(request):
        raise Refused("gate consulted")

    monkeypatch.setattr(main, "get_authenticated_user", refuse)

    for filename in sorted(DOCUMENT_FILENAMES):
        resp = client.get(f"/{filename}")
        assert resp.status_code == 500, (
            f"{filename} did not consult the auth gate -- it answered "
            f"{resp.status_code} while the gate was configured to refuse."
        )

    # The SPA shell is not gated, so it still serves with the gate refusing.
    assert client.get("/").status_code == 200


def test_spa_fallback_and_asset_404s_are_unchanged():
    """Guards the rest of the route, which shares the same handler."""
    # Unknown client-side routes fall through to the SPA shell.
    assert client.get("/some/deep/client/route").status_code == 200

    # A missing asset must 404 rather than fall back to index.html, or the
    # browser receives HTML where it asked for JavaScript.
    missing = client.get("/assets/does-not-exist.js")
    assert missing.status_code == 404
    assert b"<html" not in missing.content.lower()

    # API and WebSocket namespaces are not hijacked by the SPA fallback.
    assert client.get("/api/no-such-endpoint").status_code == 404
    assert client.get("/ws/no-such-socket").status_code == 404


def test_path_traversal_does_not_escape_the_served_directory():
    """A traversal attempt must not read outside the build directory."""
    for attempt in [
        "/../etc/passwd",
        "/../../etc/passwd",
        "/..%2f..%2fetc%2fpasswd",
        "/assets/../../../etc/passwd",
    ]:
        resp = client.get(attempt)
        assert b"root:" not in resp.content, f"{attempt} escaped the build directory"
        assert resp.status_code in (200, 404), (
            f"{attempt} returned {resp.status_code}; expected the SPA fallback "
            f"or a 404, not a server error."
        )
