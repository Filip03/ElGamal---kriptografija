import math

def encode_string (mssg: str, p: int) -> list[int]:
    raw = mssg.encode("utf-8")
    block_size = math.floor(math.log(p, 256))

    blocks = []
    for i in range(0, len(raw), block_size):
        chunk = raw[i : i + block_size]
        blocks.append(int.from_bytes(chunk, 'big'))
    
    return blocks

