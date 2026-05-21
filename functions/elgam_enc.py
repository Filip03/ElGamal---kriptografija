import random

from functions.encode_string import encode_string

def elgam_enc(mssg: str, p: str, g: str, ga: str) -> list[tuple]:
    p = int(p)
    g = int(g)
    ga = int(ga)

    blocks = encode_string(mssg, p)

    results = []
    for m in blocks:
        km = random.randrange(1, p - 1)
        c1 = pow(g, km, p)
        shared = pow(ga, km, p)
        c2 = (m * shared) % p
        results.append((c1, c2))

    return results
