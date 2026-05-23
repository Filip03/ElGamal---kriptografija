from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from functions.elgam_dec import elgam_dec

router = APIRouter()

class DecryptionReq(BaseModel):
    cipher: list[tuple]
    p: str
    a: str

class DecryptionResponse(BaseModel):
    mssg: str

@router.post('')
def decrypt(req: DecryptionReq):
    try:
        result = elgam_dec(req.cipher, req.p, req.a)
        return DecryptionResponse(mssg = result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))