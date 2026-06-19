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

        def nondet() -> typing.Any:
            task = f"""
You are a professional credential verification specialist.

Credential to verify:
- Type: {cred_type}
- Title: {cred_title}
- Institution or Company: {cred_inst}

Your task:
1. Confirm '{cred_inst}' is a real, legitimate institution or company.
2. Check if a '{cred_title}' credential from '{cred_inst}' is plausible.
3. Flag red flags: misspellings, non-existent institutions, implausible claims.

Respond with the following JSON format:
{{
    "verdict": str,   // exactly one of: "VERIFIED", "REVIEWING", or "FAILED"
    "reasoning": str  // one sentence explanation
}}
It is mandatory that you respond only using the JSON format above, nothing else.
Don't include any other words or characters, your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors.
            """
            result = gl.nondet.exec_prompt(task).replace("```json", "").replace("```", "")
            parsed = json.loads(result)
            v = str(parsed.get("verdict", "REVIEWING")).upper()
            if v not in ("VERIFIED", "REVIEWING", "FAILED"):
                v = "REVIEWING"
            r = str(parsed.get("reasoning", "No reasoning provided."))
            return json.dumps({"verdict": v, "reasoning": r}, sort_keys=True)

        raw    = gl.eq_principle.strict_eq(nondet)
        parsed = json.loads(raw)

        self.verdicts[credential_blob_id] = json.dumps({
            "verdict":     parsed["verdict"],
            "reasoning":   parsed["reasoning"],
            "timestamp":   gl.message.timestamp,
            "type":        credential_type,
            "title":       title,
            "institution": institution,
        })

        # update reputation
        existing_rep = self.reputations.get(owner_wallet)
        if existing_rep is None:
            rep = {"score": 100, "verified": 0, "failed": 0}
        else:
            rep = json.loads(existing_rep)

        if parsed["verdict"] == "VERIFIED":
            rep["verified"] += 1
            rep["score"]     = min(100, rep["score"] + 2)
        elif parsed["verdict"] == "FAILED":
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