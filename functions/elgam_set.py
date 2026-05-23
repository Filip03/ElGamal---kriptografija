from functions.prim_num_find import prim_num_find
import random

def elgam_set(k: int):

    p = int(prim_num_find(k))

    a = random.randint(1, p - 2)

    g = find_generator(p)

    ga = pow(g, a, p)


    return str(p), str(g), str(a), str(ga)


def prime_factors(n: int):

    factors = set()

    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.add(d)
            n //= d
        
        d += 1
    
    if n > 1:
        factors.add(n)
    

    return factors


def find_generator(p: int):

    factors = prime_factors(p - 1)

    while True:
        g = random.randint(2, p - 1)

        if all(pow(g, (p-1) // q, p) != 1 for q in factors):
            return g
        


        
