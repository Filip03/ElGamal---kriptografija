from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from functions.elgam_enc import elgam_enc
from functions.elgam_set import elgam_set

router = APIRouter()

class EncryptionReq(BaseModel):
    mssg: str
    k: int

class EncryptionResponse(BaseModel):
    cipher: list[tuple[str, str]]
    p: str
    g: str
    a: str
    ga: str

@router.post("")
def encrypt(req: EncryptionReq):
    try:
        p, g, a, ga = elgam_set(req.k)
        result = elgam_enc(req.mssg, p, g, ga)
        return EncryptionResponse(cipher=[(str(c1), str(c2)) for c1, c2 in result], p = p, g = g,
                                a = a, ga = ga)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
