import math

from functions.decode_blocks import decode_blocks

def elgam_dec(cipher: list[tuple], p: str, a: str) -> str:
    p = int(p)
    a = int(a)

    block_size = math.floor(math.log(p, 256))

    blocks = []
    for c1, c2 in cipher:
        c1 = int(c1)
        c2 = int(c2)
        shared = pow(c1, a, p)
        inv = pow(shared, p - 2, p)
        m = (c2 * inv) % p
        blocks.append(m)
        
    return decode_blocks(blocks, block_size) 
