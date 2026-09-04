"""Grant admin access to a user by email.
Usage: python make_admin.py user@example.com
"""
import sys, sqlite3, os

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dossier.db")

if len(sys.argv) != 2:
    print("Usage: python make_admin.py <email>")
    sys.exit(1)

email = sys.argv[1].strip().lower()
with sqlite3.connect(DB) as conn:
    cur = conn.execute("UPDATE users SET is_admin=1 WHERE email=?", (email,))
    if cur.rowcount:
        print(f"✓ {email} is now an admin.")
    else:
        print(f"✗ No user found with email: {email}")
