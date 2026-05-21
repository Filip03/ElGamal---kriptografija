def decode_blocks(blocks: list[int], block_size: int) -> str:
    raw = b""
    for num in blocks:
        raw += num.to_bytes(block_size, 'big')

    return raw.decode("utf-8")