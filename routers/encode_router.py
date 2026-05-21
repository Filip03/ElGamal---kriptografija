from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from functions.elgam_enc import elgam_enc

router = APIRouter()

class EncryptionReq(BaseModel):
    mssg: str
    p: str
    g: str
    ga: str

class EncryptionResponse(BaseModel):
    cipher: list[tuple[str, str]]

@router.get("")
def encrypt(req: EncryptionReq):
    try:
        result = elgam_enc(req.mssg, req.p, req.g, req.ga)
        return EncryptionResponse(cipher=[(str(c1), str(c2)) for c1, c2 in result])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
