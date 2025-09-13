### install dependencies
```
cd backend
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### update dependencies
```
pip freeze > requirements.txt
```