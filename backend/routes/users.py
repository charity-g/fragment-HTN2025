from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import requests

router = APIRouter()

AUTH0_DOMAIN = "YOUR_AUTH0_DOMAIN"
API_IDENTIFIER = "YOUR_API_IDENTIFIER"
ALGORITHMS = ["RS256"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_auth0_public_key():
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    jwks = requests.get(jwks_url).json()
    return jwks

def verify_jwt(token: str = Depends(oauth2_scheme)):
    jwks = get_auth0_public_key()
    unverified_header = jwt.get_unverified_header(token)
    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_IDENTIFIER,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )


@router.post("/{user_id}/follow/")
async def follow_user(user_id: str, token_payload: dict = Depends(verify_jwt)):
    # Here you would implement the logic to follow a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "action": "followed"}

@router.get("/{user_id}/gifs")
async def get_user_gifs(user_id: str, token_payload: dict = Depends(verify_jwt)):
    # Here you would implement the logic to retrieve all GIFs for a user
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "gifs": []}

@router.get("/{user_id}")
async def get_user(user_id: str, token_payload: dict = Depends(verify_jwt)):
    # Here you would implement the logic to retrieve user details
    # For now, we'll just return a dummy response
    return {"status": "success", "user_id": user_id, "name": "John Doe"}
