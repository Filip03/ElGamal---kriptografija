from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title = 'ElGamal kripto-sistem', version='1.0.0')

app.add_middleware(CORSMiddleware,
                    allow_origins=["*"],
                    allow_methods=["*"],
                    allow_headers=["*"]
                    )

@app.get('/')
async def root():
    return {"status": "ok", "message": "FastAPI bekend je inicijalizovan"}

#ideja je da u functions folderu pisemo sve python funkcije koje trebaju za ElGamal sistem
#a zatim da u routers folder napravimo rute koju su potrebne za front i koje ce samo pozivati 
#funkcije iz functions foldera
#npr. rute /encode i /decode
#funkcije elgam_enc, elgam_dec, elgam_set, prim-num_find, miller_rabin