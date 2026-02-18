from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import date

app = FastAPI(title="HRMS Lite API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for demo/assignment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./hrms.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    department = Column(String)
    attendance = relationship("Attendance", back_populates="employee", cascade="all, delete")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    status = Column(String)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    employee = relationship("Employee", back_populates="attendance")

Base.metadata.create_all(bind=engine)

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str

    class Config:
        orm_mode = True

class AttendanceCreate(BaseModel):
    date: date
    status: str

class AttendanceOut(BaseModel):
    id: int
    date: date
    status: str

    class Config:
        orm_mode = True

@app.get("/employees", response_model=List[EmployeeOut])
def get_employees():
    db = SessionLocal()
    return db.query(Employee).all()

@app.post("/employees", response_model=EmployeeOut, status_code=201)
def create_employee(emp: EmployeeCreate):
    db = SessionLocal()

    if db.query(Employee).filter(Employee.employee_id == emp.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    if db.query(Employee).filter(Employee.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_emp = Employee(
        employee_id=emp.employee_id,
        full_name=emp.full_name,
        email=emp.email,
        department=emp.department
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

@app.delete("/employees/{emp_id}", status_code=204)
def delete_employee(emp_id: int):
    db = SessionLocal()
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return

@app.post("/employees/{emp_id}/attendance", response_model=AttendanceOut, status_code=201)
def mark_attendance(emp_id: int, att: AttendanceCreate):
    db = SessionLocal()
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if att.status not in ["Present", "Absent"]:
        raise HTTPException(status_code=400, detail="Status must be Present or Absent")

    record = Attendance(date=att.date, status=att.status, employee=emp)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@app.get("/employees/{emp_id}/attendance", response_model=List[AttendanceOut])
def get_attendance(emp_id: int):
    db = SessionLocal()
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp.attendance
