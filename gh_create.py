"""Push AURA to GitHub using curl.exe (avoids SSL cert issues)."""
import sys, subprocess, json, os

TOKEN = "ghp_IznkdlwJUKDqKNzgDn6QwKFPtcYPGmku2C1dOg"
REPO  = "aura-agent"
CWD   = os.path.dirname(os.path.abspath(__file__))

print("Step 1: Getting GitHub username...")
r = subprocess.run([
    "curl.exe", "-s", "-k",
    "-H", f"Authorization: token {TOKEN}",
    "-H", "User-Agent: AURA-Deploy",
    "https://api.github.com/user"
], capture_output=True, text=True)

user_data = json.loads(r.stdout)
username = user_data.get("login", "")
if not username:
    print("ERROR: Could not get username:", r.stdout)
    sys.exit(1)
print(f"  Logged in as: {username}")

print("Step 2: Creating GitHub repository...")
payload = json.dumps({"name": REPO, "description": "AURA - Autonomous Unified Research Agent", "private": False, "auto_init": False})
r2 = subprocess.run([
    "curl.exe", "-s", "-k",
    "-X", "POST",
    "-H", f"Authorization: token {TOKEN}",
    "-H", "Content-Type: application/json",
    "-H", "User-Agent: AURA-Deploy",
    "-d", payload,
    "https://api.github.com/user/repos"
], capture_output=True, text=True)

repo_data = json.loads(r2.stdout)
if "clone_url" in repo_data:
    clone_url = repo_data["clone_url"]
    print(f"  Repo created: {repo_data['html_url']}")
elif repo_data.get("errors", [{}])[0].get("message", "").startswith("name already exists"):
    clone_url = f"https://github.com/{username}/{REPO}.git"
    print(f"  Repo already exists: {clone_url}")
else:
    print("  Repo response:", r2.stdout)
    clone_url = f"https://github.com/{username}/{REPO}.git"
    print(f"  Assuming URL: {clone_url}")

print("Step 3: Setting git remote...")
auth_url = clone_url.replace("https://", f"https://{TOKEN}@")
subprocess.run(["git", "remote", "remove", "origin"], cwd=CWD, capture_output=True)
subprocess.run(["git", "remote", "add", "origin", auth_url], cwd=CWD, check=True)

print("Step 4: Pushing to GitHub...")
r3 = subprocess.run(
    ["git", "push", "-u", "origin", "main"],
    cwd=CWD, capture_output=True, text=True
)
print(r3.stdout)
print(r3.stderr)

if r3.returncode == 0:
    print(f"\n✅ SUCCESS! Code is live at:")
    print(f"   https://github.com/{username}/{REPO}")
    print(f"\nNow go to Vercel and import this repo:")
    print(f"   https://vercel.com/new")
else:
    print(f"\n❌ Push failed (code {r3.returncode})")
