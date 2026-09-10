from enum import Enum

from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.models.user import User


class Role(str, Enum):
    ADMIN = "admin"
    CREATOR = "creator"
    BUYER = "buyer"


ADMIN_ROLES = [Role.ADMIN]
MANAGER_ROLES = [Role.ADMIN, Role.CREATOR]
READER_ROLES = [Role.ADMIN, Role.CREATOR, Role.BUYER]


PERMISSIONS = {
    "users": {
        "create": ADMIN_ROLES,
        "read": ADMIN_ROLES,
        "update": ADMIN_ROLES,
        "delete": ADMIN_ROLES,
    },
    "creators": {
        "create": ADMIN_ROLES,
        "read": READER_ROLES,
        "update": MANAGER_ROLES,
        "delete": ADMIN_ROLES,
    },
    "campaigns": {
        "create": MANAGER_ROLES,
        "read": READER_ROLES,
        "update": MANAGER_ROLES,
        "delete": MANAGER_ROLES,
    },
    "tasks": {
        "create": MANAGER_ROLES,
        "read": READER_ROLES,
        "update": MANAGER_ROLES,
        "delete": ADMIN_ROLES,
    },
    "clients": {
        "create": ADMIN_ROLES,
        "read": READER_ROLES,
        "update": ADMIN_ROLES,
        "delete": ADMIN_ROLES,
    },
    "devices": {
        "create": MANAGER_ROLES,
        "read": MANAGER_ROLES,
        "update": MANAGER_ROLES,
        "delete": MANAGER_ROLES,
    },
    "automation": {
        "create": MANAGER_ROLES,
        "read": MANAGER_ROLES,
        "update": MANAGER_ROLES,
        "delete": MANAGER_ROLES,
    },
    "payments": {
        "create": ADMIN_ROLES,
        "read": READER_ROLES,
        "update": ADMIN_ROLES,
        "delete": ADMIN_ROLES,
    },
    "integrations": {
        "create": ADMIN_ROLES,
        "read": MANAGER_ROLES,
        "update": ADMIN_ROLES,
        "delete": ADMIN_ROLES,
    },
    "settings": {
        "create": ADMIN_ROLES,
        "read": READER_ROLES,
        "update": ADMIN_ROLES,
        "delete": ADMIN_ROLES,
    },
}


def require_role(*allowed_roles: Role):
    async def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in [r.value for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user
    return checker


def require_permission(resource: str, action: str):
    allowed = PERMISSIONS.get(resource, {}).get(action, [])
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied: {action} on {resource}",
        )

    async def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in [r.value for r in allowed]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions for {action} on {resource}",
            )
        return user
    return checker
