from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.policies import Role, require_role
from app.auth.schemas import (
    ChangePasswordRequest,
    CompleteOnboardingRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    UpdateRoleRequest,
    UserResponse,
)
from app.auth.service import (
    authenticate_user,
    clear_session_cookie,
    create_access_token,
    create_user,
    get_user_by_email,
    hash_password,
    set_session_cookie,
    verify_password,
)
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    result = await db.execute(select(func.count(User.id)))
    user_count = result.scalar() or 0
    role = Role.ADMIN.value if user_count == 0 else Role.CREATOR.value
    user = await create_user(db, body.email, body.password, body.full_name, role)
    return user


@router.post("/login")
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, body.username, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(data={"sub": user.email, "role": user.role})
    set_session_cookie(response, token)
    return {"message": "Logged in", "user": {"id": user.id, "email": user.email, "name": user.full_name, "role": user.role}}


@router.post("/logout")
async def logout(response: Response):
    clear_session_cookie(response)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.email is not None:
        existing = await get_user_by_email(db, body.email)
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use",
            )
        user.email = body.email
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, body.email)
    if user is None:
        return {"message": "If the email exists, a reset link has been sent"}
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password reset not yet implemented",
    )


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password changed"}


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(Role.ADMIN)),
):
    from app.auth.service import get_all_users
    return await get_all_users(db)


@router.put("/me/role", response_model=UserResponse)
async def update_role(
    body: UpdateRoleRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.role = body.role
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/complete-onboarding", response_model=UserResponse)
async def complete_onboarding(
    body: CompleteOnboardingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.role:
        user.role = body.role
    await db.commit()
    await db.refresh(user)
    return user
