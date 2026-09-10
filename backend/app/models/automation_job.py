import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AutomationJob(Base):
    __tablename__ = "automation_jobs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255))
    creator_id: Mapped[str] = mapped_column(String(36))
    device_id: Mapped[str] = mapped_column(String(36))
    type: Mapped[str] = mapped_column(String(50))
    schedule: Mapped[str] = mapped_column(String(100), default="")
    payload: Mapped[str] = mapped_column(String(5000), default="{}")
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
