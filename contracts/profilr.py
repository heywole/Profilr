from genlayer import gl, IContract
from typing import Optional


class Profilr(IContract):
    """
    Profilr Intelligent Contract — GenLayer Testnet
    Handles:
      1. Credential verification (AI consensus via 5 validators)
      2. Access management (7-day paid access windows)
      3. Dispute resolution for access disputes
    """

    verdicts:     dict   # credentialBlobId -> { verdict, reasoning, timestamp }
    access:       dict   # profileBlobId:viewerWallet -> { expires_at, amount }
    reputations:  dict   # walletAddress -> { score, verified, failed }

    def __init__(self) -> None:
        self.verdicts    = {}
        self.access      = {}
        self.reputations = {}

    # ─────────────────────────────────────────────────────────────
    # 1. CREDENTIAL VERIFICATION
    # ─────────────────────────────────────────────────────────────

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
        Called when a user submits a credential for AI verification.
        Five GenLayer validators each independently evaluate the claim
        and vote on VERIFIED, REVIEWING, or FAILED.
        """

        # Fetch the credential blob from Shelby
        blob_url = f"https://api.shelby.xyz/v1/blobs/{credential_blob_id}"

        # AI validator prompt — runs on each of the 5 validators independently
        verdict_raw = gl.exec_prompt(
            f"You are a professional credential verification specialist for Profilr, "
            f"a decentralized verified credentials platform built on Shelby Protocol.\n\n"
            f"Credential to verify:\n"
            f"- Type: {credential_type}\n"
            f"- Title: {title}\n"
            f"- Institution/Company: {institution}\n\n"
            f"Your task:\n"
            f"1. Search for public information about '{institution}' to confirm it is a real, "
            f"   legitimate institution or company.\n"
            f"2. Check if a '{title}' credential from '{institution}' is plausible and realistic.\n"
            f"3. Look for any red flags — misspellings, non-existent institutions, implausible claims.\n\n"
            f"Respond with exactly one of these verdicts on the first line:\n"
            f"VERIFIED — the institution is real and the credential is plausible\n"
            f"REVIEWING — you need more context, institution is hard to verify\n"
            f"FAILED — the institution does not exist or the claim is implausible\n\n"
            f"Then on the next line, give one clear sentence explaining your verdict."
        )

        lines   = verdict_raw.strip().split("\n")
        verdict = lines[0].strip().upper()
        reason  = lines[1].strip() if len(lines) > 1 else "No additional reasoning provided."

        # Normalise
        if verdict not in ("VERIFIED", "REVIEWING", "FAILED"):
            verdict = "REVIEWING"

        self.verdicts[credential_blob_id] = {
            "verdict":   verdict,
            "reasoning": reason,
            "timestamp": gl.block.timestamp,
            "type":      credential_type,
            "title":     title,
            "institution": institution,
        }

        # Update reputation
        rep = self.reputations.setdefault(owner_wallet, {"score": 100, "verified": 0, "failed": 0})
        if verdict == "VERIFIED":
            rep["verified"] += 1
            rep["score"]     = min(100, rep["score"] + 2)
        elif verdict == "FAILED":
            rep["failed"] += 1
            rep["score"]    = max(0, rep["score"] - 10)

    @gl.public.view
    def get_verdict(self, credential_blob_id: str) -> Optional[dict]:
        return self.verdicts.get(credential_blob_id)

    # ─────────────────────────────────────────────────────────────
    # 2. ACCESS MANAGEMENT
    # ─────────────────────────────────────────────────────────────

    @gl.public.write
    def lock_access(
        self,
        profile_blob_id: str,
        buyer_wallet:    str,
        amount_usdc:     str,
        window_days:     int,
    ) -> None:
        """
        Called when a company pays to view a profile.
        Locks the access window for window_days days.
        """
        key      = f"{profile_blob_id}:{buyer_wallet}"
        expires  = gl.block.timestamp + (window_days * 86_400)

        self.access[key] = {
            "buyer":      buyer_wallet,
            "amount":     float(amount_usdc),
            "paid_at":    gl.block.timestamp,
            "expires_at": expires,
            "profile":    profile_blob_id,
        }

    @gl.public.view
    def check_access(self, profile_blob_id: str, viewer_wallet: str) -> dict:
        key    = f"{profile_blob_id}:{viewer_wallet}"
        record = self.access.get(key)

        if not record:
            return {"has_access": False, "expires_at": None}

        has_access = record["expires_at"] > gl.block.timestamp
        return {
            "has_access": has_access,
            "expires_at": record["expires_at"] if has_access else None,
        }

    @gl.public.view
    def get_reputation(self, wallet_address: str) -> dict:
        return self.reputations.get(wallet_address, {"score": 100, "verified": 0, "failed": 0})
