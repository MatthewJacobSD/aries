from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.automation.schemas import CreateJobRequest, JobLogsResponse, JobResponse
from app.automation.service import (
    cancel_job,
    create_job,
    get_job,
    get_job_logs,
    list_jobs,
    update_job_status,
)
from app.database import get_db

router = APIRouter(prefix="/api/automation", tags=["automation"])


@router.get("/jobs", response_model=dict)
async def list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_jobs(db, page, limit, status)


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateJobRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await create_job(db, **body.model_dump())


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_one(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/jobs/{job_id}/pause", response_model=JobResponse)
async def pause(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return await update_job_status(db, job, "paused")


@router.post("/jobs/{job_id}/resume", response_model=JobResponse)
async def resume(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return await update_job_status(db, job, "running")


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await cancel_job(db, job)


@router.get("/jobs/{job_id}/logs", response_model=JobLogsResponse)
async def logs(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobLogsResponse(logs=await get_job_logs(job_id))
