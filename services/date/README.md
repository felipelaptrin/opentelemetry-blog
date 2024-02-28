# Date Service

This is a simple (dummy) API that returns the current day (0 to Monday... and 6 to Sunday)


## Running locally

Make sure you have `pipenv` installed locally.

1) CD into the service folder
```shell
cd services/date
```

2) Enable `pipenv` shell
```shell
pipenv shell
```

3) Install dependencies
```shell
pipenv install
```

4) Run locally
```shell
pipenv run uvicorn main:app --reload
```