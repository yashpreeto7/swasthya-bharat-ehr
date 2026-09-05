from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.entities import User, Patient, Practitioner, Lab
from backend.app.schemas.models import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check if email already registered
    stmt = select(User).where(User.email == req.email.lower())
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    # 2. Validate role
    role = req.role.upper()
    if role not in ["PATIENT", "DOCTOR", "LAB"]:
        raise HTTPException(status_code=400, detail="Role must be one of: PATIENT, DOCTOR, LAB")

    # 3. Create User
    user = User(
        email=req.email.lower(),
        hashed_password=get_password_hash(req.password),
        role=role,
        full_name=req.full_name
    )
    db.add(user)
    await db.flush()

    patient_id = None
    practitioner_id = None
    lab_id = None
    abha_id = None

    # 4. Create role-specific profile
    if role == "PATIENT":
        abha_id = req.abha_id or f"91-{hash(req.email) % 8999 + 1000}-{hash(req.full_name) % 8999 + 1000}-0001"
        patient = Patient(
            user_id=user.id,
            abha_id=abha_id,
            date_of_birth=req.date_of_birth or "1990-01-01",
            gender=req.gender or "Other",
            blood_group=req.blood_group or "B+"
        )
        db.add(patient)
        await db.flush()
        patient_id = patient.id

    elif role == "DOCTOR":
        reg_num = req.registration_number or f"MCI-{hash(req.email) % 89999 + 10000}"
        practitioner = Practitioner(
            user_id=user.id,
            registration_number=reg_num,
            specialization=req.specialization or "General Medicine",
            hospital_name=req.hospital_name or "Apollo Hospitals"
        )
        db.add(practitioner)
        await db.flush()
        practitioner_id = practitioner.id

    elif role == "LAB":
        lic_num = req.license_number or f"NABL-{hash(req.email) % 89999 + 10000}"
        lab = Lab(
            user_id=user.id,
            lab_name=req.lab_name or "Dr. Lal PathLabs Diagnostic Centre",
            license_number=lic_num
        )
        db.add(lab)
        await db.flush()
        lab_id = lab.id

    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        patient_id=patient_id,
        practitioner_id=practitioner_id,
        lab_id=lab_id,
        abha_id=abha_id
    )
    return TokenResponse(access_token=token, user=user_resp)

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email.lower()).options(
        selectinload(User.patient_profile),
        selectinload(User.practitioner_profile),
        selectinload(User.lab_profile)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    patient_id = user.patient_profile.id if user.patient_profile else None
    practitioner_id = user.practitioner_profile.id if user.practitioner_profile else None
    lab_id = user.lab_profile.id if user.lab_profile else None
    abha_id = user.patient_profile.abha_id if user.patient_profile else None

    token = create_access_token(subject=user.id, role=user.role)
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        patient_id=patient_id,
        practitioner_id=practitioner_id,
        lab_id=lab_id,
        abha_id=abha_id
    )
    return TokenResponse(access_token=token, user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == current_user.id).options(
        selectinload(User.patient_profile),
        selectinload(User.practitioner_profile),
        selectinload(User.lab_profile)
    )
    res = await db.execute(stmt)
    user = res.scalar_one()

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        patient_id=user.patient_profile.id if user.patient_profile else None,
        practitioner_id=user.practitioner_profile.id if user.practitioner_profile else None,
        lab_id=user.lab_profile.id if user.lab_profile else None,
        abha_id=user.patient_profile.abha_id if user.patient_profile else None
    )
