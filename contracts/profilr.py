# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


class Profilr(gl.Contract):
    """
    Profilr Intelligent Contract — GenLayer Testnet
    1. Credential verification via AI consensus (5 validators)
    2. Access management (7-day paid access windows)
    3. Reputation scoring per wallet
    """

    verdicts:    TreeMap[str, str]
    access:      TreeMap[str, str]
    reputations: TreeMap[str, str]

    def __init__(self) -> None:
        pass

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

        cred_type  = credential_type
        cred_title = title
        cred_inst  = institution

        # IMPORTANT: this nondet block returns ONLY a single word.
        # Free-text reasoning was removed from the consensus path because
        # strict_eq requires byte-for-byte identical output across all
        # validators — and five separate LLM calls will never phrase
        # the same sentence the exact same way, even when they agree.
        # Narrowing the output to one of three fixed words makes
        # consensus realistic.
        def nondet() -> str:
            task = f"""
You are a professional credential verification specialist.

Credential to verify:
- Type: {cred_type}
- Title: {cred_title}
- Institution or Company: {cred_inst}

Confirm whether '{cred_inst}' is a real, legitimate institution or
company, and whether a '{cred_title}' credential from it is plausible.

Respond with EXACTLY ONE WORD, nothing else, no punctuation, no explanation:
VERIFIED
REVIEWING
FAILED
            """
            result = gl.nondet.exec_prompt(task).strip().upper()
            # Defensive cleanup in case the model adds stray characters
            for word in ("VERIFIED", "REVIEWING", "FAILED"):
                if word in result:
                    return word
            return "REVIEWING"

        verdict = gl.eq_principle.strict_eq(nondet)

        # Reasoning is generated AFTER consensus is reached, by the
        # leader only, as a simple templated explanation — not part
        # of the consensus-critical path.
        reasoning = f"GenLayer validator consensus: institution and credential type were evaluated as {verdict}."

        self.verdicts[credential_blob_id] = json.dumps({
            "verdict":     verdict,
            "reasoning":   reasoning,
            "timestamp":   gl.message.timestamp,
            "type":        credential_type,
            "title":       title,
            "institution": institution,
        })

        existing_rep = self.reputations.get(owner_wallet)
        if existing_rep is None:
            rep = {"score": 100, "verified": 0, "failed": 0}
        else:
            rep = json.loads(existing_rep)

        if verdict == "VERIFIED":
            rep["verified"] += 1
            rep["score"]     = min(100, rep["score"] + 2)
        elif verdict == "FAILED":
            rep["failed"] += 1
            rep["score"]    = max(0, rep["score"] - 10)

        self.reputations[owner_wallet] = json.dumps(rep)

    @gl.public.view
    def get_verdict(self, credential_blob_id: str) -> dict[str, typing.Any]:
        raw = self.verdicts.get(credential_blob_id)
        if raw is None:
            return {}
        return json.loads(raw)

    # ── ACCESS MANAGEMENT ────────────────────────────────────

    @gl.public.write
    def lock_access(
        self,
        profile_blob_id: str,
        buyer_wallet:    str,
        amount_usdc:     str,
        window_days:     int,
    ) -> None:
        key     = f"{profile_blob_id}:{buyer_wallet}"
        expires = gl.message.timestamp + (window_days * 86400)

        self.access[key] = json.dumps({
            "buyer":      buyer_wallet,
            "amount":     amount_usdc,
            "paid_at":    gl.message.timestamp,
            "expires_at": expires,
            "profile":    profile_blob_id,
        })

    @gl.public.view
    def check_access(self, profile_blob_id: str, viewer_wallet: str) -> dict[str, typing.Any]:
        key = f"{profile_blob_id}:{viewer_wallet}"
        raw = self.access.get(key)

        if raw is None:
            return {"has_access": False, "expires_at": None}

        record     = json.loads(raw)
        has_access = record["expires_at"] > gl.message.timestamp
        return {
            "has_access": has_access,
            "expires_at": record["expires_at"] if has_access else None,
        }

    @gl.public.view
    def get_reputation(self, wallet_address: str) -> dict[str, typing.Any]:
        raw = self.reputations.get(wallet_address)
        if raw is None:
            return {"score": 100, "verified": 0, "failed": 0}
        return json.loads(raw)