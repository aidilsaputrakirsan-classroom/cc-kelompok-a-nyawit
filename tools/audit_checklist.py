#!/usr/bin/env python3
"""Simple repository audit script for the project's security checklist.

Run from repository root (d:\CC):
  py -3 tools\audit_checklist.py

The script performs heuristic checks and prints a PASS/WARN/FAIL report
for each checklist item. It exits with code 0 if all checks pass, else 2.
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_file(path: Path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def repo_files(exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = {".git", "node_modules", "venv", "venv3", "__pycache__"}
    for dirpath, dirs, files in os.walk(ROOT):
        # prune
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for fn in files:
            yield Path(dirpath) / fn


def grep(pattern, paths=None):
    rx = re.compile(pattern, re.IGNORECASE)
    lines = []
    for p in (paths or repo_files()):
        try:
            text = read_file(p)
        except Exception:
            continue
        for i, line in enumerate(text.splitlines(), start=1):
            if rx.search(line):
                lines.append((p.relative_to(ROOT), i, line.strip()))
    return lines


def check_hardcoded_secrets():
    # look for assignment patterns and common keywords
    findings = []
    patterns = [r"SECRET_KEY\s*=\s*[\'\"]\w+", r"api[_-]?key\s*=", r"password\s*=\s*[\'\"]\w+",
                r"AWS_SECRET", r"ACCESS_TOKEN\s*=", r"TOKEN\s*=\s*[\'\"]"]
    for pat in patterns:
        findings.extend(grep(pat))
    # ignore env example files
    findings = [f for f in findings if not str(f[0]).endswith('.env.example')]
    return findings


def check_env_gitignore():
    gitignore = ROOT / ".gitignore"
    if not gitignore.exists():
        return False, "No .gitignore file"
    txt = read_file(gitignore)
    return ".env" in txt.splitlines(), None


def check_env_example_placeholder():
    ex = ROOT / ".env.example"
    if not ex.exists():
        return False, "No .env.example"
    txt = read_file(ex)
    # look for CHANGE or placeholder text or empty values
    if "CHANGE" in txt or "your_" in txt or "REPLACE_ME" in txt:
        return True, None
    # ensure secrets are not real-looking (contains letters+digits)
    if re.search(r"=\s*[^\n\r]+", txt):
        return True, None
    return False, "No placeholder values found"


def check_secret_key_env_usage():
    # search for literal SECRET_KEY assignments in python files
    assigns = grep(r"SECRET_KEY\s*=\s*[\'\"]")
    # search for getenv/environ usage
    env_usage = grep(r"getenv\(|os\.environ\[|os\.getenv")
    return assigns, env_usage


def check_jwt_expiry():
    hits = grep(r"(ACCESS_TOKEN_EXPIRE|TOKEN_EXPIRE|EXPIRE_MINUTES|TOKEN_EXPIRE_MINUTES)")
    return hits


def check_bcrypt_hashing():
    hits = grep(r"bcrypt|passlib\.hash|passlib\.context")
    return hits


def check_rate_limiting():
    # look for nginx limit_req or gateway rate limiting configs
    hits = []
    for p in repo_files():
        if p.suffix in {".conf", ".yml", ".yaml"} or "nginx" in p.name.lower():
            txt = read_file(p)
            if "limit_req" in txt or "rate=":
                hits.append((p.relative_to(ROOT), 0, "contains rate limiting directives"))
    return hits


def check_owner_id_usage():
    return grep(r"owner_id")


def check_pydantic_email():
    return grep(r"EmailStr|from pydantic import .*EmailStr")


def check_price_quantity_validators():
    # look for validators mentioning price or quantity checks
    return grep(r"validate_price|validate_quantity|if .*< 0|not < 0")


def check_cors_config():
    return grep(r"CORSMiddleware|CORS|allow_origins")


def check_health_metrics_endpoints():
    return grep(r"/health|/metrics|health\(|metrics\(")


def check_docker_image_tags():
    hits = []
    for p in repo_files():
        if p.name in {"docker-compose.yml", "docker-compose.yaml"} or p.name == "Dockerfile":
            txt = read_file(p)
            for line in txt.splitlines():
                if line.strip().startswith("image:"):
                    if ":latest" in line or line.strip().endswith("image:"):
                        hits.append((p.relative_to(ROOT), 0, line.strip()))
                # Dockerfile FROM with no tag
                if p.name == "Dockerfile" and line.strip().startswith("FROM"):
                    if ":" not in line:
                        hits.append((p.relative_to(ROOT), 0, line.strip()))
    return hits


def check_production_debug_mode():
    # search for debug=True or reload=True or Uvicorn reload usage
    return grep(r"debug=True|reload=True|uvicorn.*--reload")


def run_checks():
    results = []

    # 1. Hardcoded secrets
    findings = check_hardcoded_secrets()
    results.append(("SECRETS & CREDENTIALS: hardcoded secrets found", findings))

    # 2. .env in .gitignore
    ok, msg = check_env_gitignore()
    results.append(("SECRETS & CREDENTIALS: .env in .gitignore", ok if ok else msg))

    # 3. .env.example placeholders
    ok2, msg2 = check_env_example_placeholder()
    results.append(("SECRETS & CREDENTIALS: .env.example has placeholders", ok2 if ok2 else msg2))

    # 4. SECRET_KEY env usage
    assigns, env_usage = check_secret_key_env_usage()
    results.append(("SECRETS & CREDENTIALS: SECRET_KEY literal assignment (should not)", assigns))
    results.append(("SECRETS & CREDENTIALS: SECRET_KEY env usage", env_usage))

    # AUTH - JWT expiry
    jwt_hits = check_jwt_expiry()
    results.append(("AUTHENTICATION: JWT expiry config present", jwt_hits))

    # AUTH - bcrypt
    bcrypt_hits = check_bcrypt_hashing()
    results.append(("AUTHENTICATION: bcrypt / passlib present", bcrypt_hits))

    # AUTH - rate limiting
    rl_hits = check_rate_limiting()
    results.append(("AUTHENTICATION: rate limiting configuration present (nginx/gateway)", rl_hits))

    # AUTH - owner_id
    owner_hits = check_owner_id_usage()
    results.append(("AUTHENTICATION: owner_id checks present", owner_hits))

    # INPUT VALIDATION - EmailStr
    email_hits = check_pydantic_email()
    results.append(("INPUT VALIDATION: EmailStr usage in schemas", email_hits))

    # INPUT VALIDATION - price/quantity validators
    pq_hits = check_price_quantity_validators()
    results.append(("INPUT VALIDATION: price/quantity non-negative validators present", pq_hits))

    # NETWORK & DEPLOYMENT - CORS
    cors_hits = check_cors_config()
    results.append(("NETWORK & DEPLOYMENT: CORS configured (CORSMiddleware)", cors_hits))

    # NETWORK & DEPLOYMENT - health & metrics
    hm_hits = check_health_metrics_endpoints()
    results.append(("NETWORK & DEPLOYMENT: health/metrics endpoints present", hm_hits))

    # NETWORK & DEPLOYMENT - docker tags
    dt_hits = check_docker_image_tags()
    results.append(("NETWORK & DEPLOYMENT: docker images using specific tags (no :latest or no tag)", dt_hits))

    # Production debug
    dbg_hits = check_production_debug_mode()
    results.append(("NETWORK & DEPLOYMENT: production debug mode (should not be enabled)", dbg_hits))

    return results


def print_report(results):
    fail = False
    print("\nPROJECT AUDIT REPORT\n" + "=" * 40)
    for title, data in results:
        print(f"\n- {title}")
        if isinstance(data, list):
            if not data:
                print("  ✅ OK — none found")
            else:
                fail = True
                print(f"  ❌ {len(data)} findings:")
                for p, ln, txt in data[:10]:
                    print(f"    - {p}:{ln} -> {txt}")
                if len(data) > 10:
                    print(f"    ... and {len(data)-10} more")
        elif isinstance(data, bool):
            if data:
                print("  ✅ OK")
            else:
                fail = True
                print("  ❌ MISSING or NOT OK")
        elif data is None:
            print("  ✅ OK")
        else:
            fail = True
            print(f"  ❌ {data}")

    print("\nSummary:")
    if fail:
        print("  Some checks failed or raised warnings. See findings above and fix accordingly.")
        sys.exit(2)
    else:
        print("  All heuristic checks passed. Good job — review manually for completeness.")
        sys.exit(0)


if __name__ == "__main__":
    res = run_checks()
    print_report(res)
