### install dependencies
```
cd backend
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Using Conda:
```
conda create -n venv python=3.11 pip
conda activate venv
pip install -r requirements.txt
```

### update dependencies
```
pip freeze > requirements.txt
```

### run with Docker
```
docker build -t backend-app .
docker run -p 8000:8000 backend-app
```
Access the backend at [http://localhost:8000](http://localhost:8000)



