import os

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.campaigns.router import router as campaigns_router
from app.clients.router import router as clients_router
from app.config import settings
from app.creators.router import router as creators_router
from app.database import create_tables
from app.devices.router import router as devices_router
from app.automation.router import router as automation_router
from app.payments.router import router as payments_router
from app.integrations.router import router as integrations_router
from app.tasks.router import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("APP_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(creators_router)
app.include_router(campaigns_router)
app.include_router(tasks_router)
app.include_router(clients_router)
app.include_router(devices_router)
app.include_router(automation_router)
app.include_router(payments_router)
app.include_router(integrations_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/")
async def index_root():
    return {"message": "Backend Response is clear", "status": "ok"}


@app.get("/ping")
async def pong():
    return {"ping": "pong!"}
