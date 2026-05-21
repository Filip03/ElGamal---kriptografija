from functions.elgam_enc import elgam_enc
from functions.elgam_dec import elgam_dec

p  = "104723"
g  = "5"
a  = "12345"
ga = str(pow(5, 12345, 104723))

message = "Filip"

ciphertext = elgam_enc(message, p, g, ga)
print("Ciphertext:", ciphertext)

decrypted = elgam_dec(ciphertext, p, a)
print("Decrypted:", decrypted)