import random

def prim_num_find(num_digits: int):
    
    lowest = 10 ** (num_digits - 1)
    highest = 10 ** num_digits - 1

    while True:
        p = random.randint(lowest, highest)

        if p % 2 == 0:
            continue

        if miller_rabin(p):
            return str(p)



def miller_rabin(n: int, k = 10):
    
    if n == 2 or n == 3:
        return True
    
    if n <= 1 or n % 2 == 0:
        return False
    
    d = n - 1
    r = 0

    while d % 2 == 0:
        d //= 2
        r += 1

    
    for _ in range(k):

        a = random.randint(2, n - 2)

        x = pow(a, d, n)

        if x == 1 or x == n - 1:
            continue

        for _ in range(r - 1):
            x = pow(x, 2, n)

            if x == n - 1:
                break
                
        else:
            return False

    return True        
