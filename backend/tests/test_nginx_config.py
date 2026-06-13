from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NGINX_CONFIG = ROOT / "nginx.conf"


def test_nginx_gateway_has_auth_rate_limit_zones() -> None:
    config = NGINX_CONFIG.read_text(encoding="utf-8")

    assert "limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;" in config
    assert "limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;" in config
    assert "limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;" in config


def test_nginx_gateway_applies_auth_rate_limits() -> None:
    config = NGINX_CONFIG.read_text(encoding="utf-8")

    assert "location = /api/v1/auth/login" in config
    assert "limit_req zone=auth_limit burst=10 nodelay;" in config
    assert "location = /api/v1/auth/register" in config
    assert "limit_req zone=auth_limit burst=5 nodelay;" in config


def test_nginx_gateway_applies_api_rate_limit() -> None:
    config = NGINX_CONFIG.read_text(encoding="utf-8")

    assert "location /api/" in config
    assert "limit_req zone=api_limit burst=30 nodelay;" in config


def test_nginx_gateway_returns_json_rate_limit_error() -> None:
    config = NGINX_CONFIG.read_text(encoding="utf-8")

    assert "error_page 429 = @rate_limited;" in config
    assert "return 429 '{\"detail\": \"Too many requests. Please try again later.\"}';" in config
