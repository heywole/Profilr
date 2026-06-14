# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class Profilr(gl.Contract):
    """
    Profilr Intelligent Contract — GenLayer Testnet
    1. Credential verification via AI consensus (5 validators)
    2. Access management (7-day paid access windows)
    3. Reputation scoring per wallet
    """

    verdicts:    dict  # credentialBlobId -> { verdict, reasoning, timestamp }
    access:      dict  # profileBlobId:viewerWallet -> { expires_at, amount }
    reputations: dict  # walletAddress -> { score, verified, failed }

    def __init__(self) -> None:
        self.verdicts    = {}
        self.access      = {}
        self.reputations = {}

    # ── CREDENTIAL VERIFICATION ──────────────────────────────

    @gl.public.write
    def verify_credential(
        self,
        credential_blob_id: str,
        credential_type:    str,
        title:              str,
        institution:        str,
        owner_wallet:       str,
    ) -> None:
        """
        Submit a credential for AI verification.
        Five GenLayer validators each independently evaluate
        and vote on VERIFIED, REVIEWING, or FAILED.
        """
        verdict_raw = gl.exec_prompt(
            f"You are a professional credential verification specialist.\n\n"
            f"Credential to verify:\n"
            f"- Type: {credential_type}\n"
            f"- Title: {title}\n"
            f"- Institution or Company: {institution}\n\n"
            f"Your task:\n"
            f"1. Search public information to confirm '{institution}' is a real, legitimate institution or company.\n"
            f"2. Check if a '{title}' credential from '{institution}' is plausible and realistic.\n"
            f"3. Flag any red flags such as misspellings, non-existent institutions, or implausible claims.\n\n"
            f"Respond with exactly one of these on the first line:\n"
            f"VERIFIED\n"
            f"REVIEWING\n"
            f"FAILED\n\n"
            f"Then on the next line give one clear sentence explaining your verdict."
        )

        lines   = verdict_raw.strip().split("\n")
        verdict = lines[0].strip().upper()
        reason  = lines[1].strip() if len(lines) > 1 else "No reasoning provided."

        if verdict not in ("VERIFIED", "REVIEWING", "FAILED"):
            verdict = "REVIEWING"

        self.verdicts[credential_blob_id] = {
            "verdict":     verdict,
            "reasoning":   reason,
            "timestamp":   gl.message.timestamp,
            "type":        credential_type,
            "title":       title,
            "institution": institution,
        }

        rep = self.reputations.setdefault(
            owner_wallet, {"score": 100, "verified": 0, "failed": 0}
        )
        if verdict == "VERIFIED":
            rep["verified"] += 1
            rep["score"]     = min(100, rep["score"] + 2)
        elif verdict == "FAILED":
            rep["failed"] += 1
            rep["score"]    = max(0,   rep["score"] - 10)

    @gl.public.view
    def get_verdict(self, credential_blob_id: str) -> dict:
        return self.verdicts.get(credential_blob_id, {})

    # ── ACCESS MANAGEMENT ────────────────────────────────────

    @gl.public.write
    def lock_access(
        self,
        profile_blob_id: str,
        buyer_wallet:    str,
        amount_usdc:     str,
        window_days:     int,
    ) -> None:
        """
        Record a paid access window for a profile.
        Called after a buyer pays to view a paid profile.
        """
        key     = f"{profile_blob_id}:{buyer_wallet}"
        expires = gl.message.timestamp + (window_days * 86400)

        self.access[key] = {
            "buyer":      buyer_wallet,
            "amount":     float(amount_usdc),
            "paid_at":    gl.message.timestamp,
            "expires_at": expires,
            "profile":    profile_blob_id,
        }

    @gl.public.view
    def check_access(self, profile_blob_id: str, viewer_wallet: str) -> dict:
        """
        Check if a wallet has active paid access to a profile.
        Returns has_access bool and expires_at timestamp.
        """
        key    = f"{profile_blob_id}:{viewer_wallet}"
        record = self.access.get(key)

        if not record:
            return {"has_access": False, "expires_at": None}

        has_access = record["expires_at"] > gl.message.timestamp
        return {
            "has_access": has_access,
            "expires_at": record["expires_at"] if has_access else None,
        }

    @gl.public.view
    def get_reputation(self, wallet_address: str) -> dict:
        return self.reputations.get(
            wallet_address,
            {"score": 100, "verified": 0, "failed": 0}
        )
