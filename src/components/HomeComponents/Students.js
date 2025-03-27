import React, { useContext, useState } from "react";
import { FirestoreContext } from "../../context/FirestoreContext";
import { Table, Button, Form } from "react-bootstrap";
import { db } from "../../firebaseConfig";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./Students.css";

function Students() {
  const { students, loading, fetchStudents } = useContext(FirestoreContext);
  const [showForm, setShowForm] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [student, setStudent] = useState({ /* 선택된 학생 정보 */ });


  const [newStudent, setNewStudent] = useState({
    school: "",
    grade: "",
    name: "",
    phone: "",
    english: false,
    math: false,
    schedule: [],
    eng_T: null,
    math_T: null,
  });

  const days = ["월", "화", "수", "목", "금"];
  const fullScheduleTemplate = [
    "월", "화", "수", "목", "금",
    "월_수학", "화_수학", "수_수학", "목_수학", "금_수학",
  ].map((day) => ({ day, start: null, end: null }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScheduleChange = (dayKey, field, value) => {
    setNewStudent((prev) => {
      const updated = [...prev.schedule];
      const idx = updated.findIndex((s) => s.day === dayKey);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], [field]: value };
      } else {
        updated.push({ day: dayKey, start: null, end: null, [field]: value });
      }
      return { ...prev, schedule: updated };
    });
  };

  const renderScheduleInputs = (subject) => {
    const keys = days.map((day) => (subject === "english" ? day : `${day}_수학`));
    return (
      <div className="schedule-grid">
        <div className="row-label" />
        {days.map((day) => <div className="col-label" key={day}>{day}</div>)}
        <div className="row-label">시작 시간</div>
        {keys.map((key) => {
          const current = newStudent.schedule.find((s) => s.day === key) || {};
          return (
            <input key={`${key}-start`} type="number" min="0" max="23" placeholder="00" value={current.start ?? ""} onChange={(e) => handleScheduleChange(key, "start", e.target.value)} />
          );
        })}
        <div className="row-label">종료 시간</div>
        {keys.map((key) => {
          const current = newStudent.schedule.find((s) => s.day === key) || {};
          return (
            <input key={`${key}-end`} type="number" min="0" max="23" placeholder="00" value={current.end ?? ""} onChange={(e) => handleScheduleChange(key, "end", e.target.value)} />
          );
        })}
      </div>
    );
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const finalSchedule = fullScheduleTemplate.map((template) => {
      const match = newStudent.schedule.find((s) => s.day === template.day);
      return match ? { ...template, ...match } : template;
    });
    const studentToSave = { ...newStudent, schedule: finalSchedule };

    try {
      const docRef = await addDoc(collection(db, "students-info"), studentToSave);
      setNewlyAddedId(docRef.id);
      await fetchStudents();
      setTimeout(() => setNewlyAddedId(null), 5000);
      alert("✅ 학생이 등록되었습니다!");
      setShowForm(false);
      setNewStudent({
        school: "",
        grade: "",
        name: "",
        phone: "",
        english: false,
        math: false,
        schedule: [],
        eng_T: null,
        math_T: null,
      });
    } catch (error) {
      console.error("❌ 학생 등록 오류:", error);
      alert("⚠️ 학생 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "students-info", id));
        await fetchStudents();
        alert("삭제 완료!");
      } catch (err) {
        console.error("삭제 오류:", err);
        alert("삭제 중 오류 발생");
      }
    }
  };

  const handleFieldChange = async (id, field, value) => {
    try {
      const docRef = doc(db, "students-info", id);
      await updateDoc(docRef, { [field]: value });
      await fetchStudents();
    } catch (err) {
      console.error("업데이트 실패:", err);
    }
  };

  const handleScheduleUpdate = async (id, newSchedule) => {
    try {
      const docRef = doc(db, "students-info", id);
      await updateDoc(docRef, { schedule: newSchedule });
      await fetchStudents();
    } catch (err) {
      console.error("시간표 업데이트 실패:", err);
    }
  };

  return (
    <div>
      <div className="students-header">
        <h3>👨‍🎓 학생 목록</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "학생 등록 닫기" : "학생 등록"}
        </Button>
      </div>
  
      {showForm && (
        <div className="student-form-container">
          <h3>➕ 학생 등록</h3>
        </div>
      )}
  
      {loading ? (
        <p>⏳ 데이터를 불러오는 중...</p>
      ) : (
        <div className="students-table-container">
          <Table bordered className="students-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>학교</th>
                <th>학년</th>
                <th>영어</th>
                <th>수학</th>
                <th>전화번호</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <React.Fragment key={student.id}>
                  <tr>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => setExpandedStudentId(
                        expandedStudentId === student.id ? null : student.id
                      )}
                    >
                      {student.id === newlyAddedId && (
                        <span style={{ color: "red", marginRight: "6px" }}>
                          new!
                        </span>
                      )}
                      {student.name}
                    </td>
                    <td>{student.school}</td>
                    <td>{student.grade}</td>
                    <td>{student.english ? "✅" + student.eng_T : "❌ 미수강"}</td>
                    <td>{student.math ? "✅" + student.math_T : "❌ 미수강"}</td>
                    <td>{student.phone}</td>
                  </tr>
                  {expandedStudentId === student.id && (
                    <tr>
                      <td colSpan="6">
                        <div className="expanded-student">
                          <div className="student-detail-wrapper">
                            <div className="subject-settings">
                              <Form.Check
                                type="checkbox"
                                label="영어 수강 여부"
                                checked={student.english}
                                onChange={(e) =>
                                  handleFieldChange(student.id, "english", e.target.checked)
                                }
                              />
                              <Form.Group className="teacher-select">
                                <Form.Label>영어 선생님</Form.Label>
                                <Form.Select
                                  value={student.eng_T || ""}
                                  onChange={(e) =>
                                    handleFieldChange(student.id, "eng_T", e.target.value)
                                  }
                                >
                                  <option value="">없음</option>
                                  <option value="T1">T1</option>
                                  <option value="T2">T2</option>
                                  <option value="T3">T3</option>
                                  <option value="T4">T4</option>
                                </Form.Select>
                              </Form.Group>
  
                              <Form.Check
                                type="checkbox"
                                label="수학 수강 여부"
                                checked={student.math}
                                onChange={(e) =>
                                  handleFieldChange(student.id, "math", e.target.checked)
                                }
                              />
                              <Form.Group className="teacher-select">
                                <Form.Label>수학 선생님</Form.Label>
                                <Form.Select
                                  value={student.math_T || ""}
                                  onChange={(e) =>
                                    handleFieldChange(student.id, "math_T", e.target.value)
                                  }
                                >
                                  <option value="">없음</option>
                                  <option value="T1">T1</option>
                                  <option value="T2">T2</option>
                                  <option value="T3">T3</option>
                                  <option value="T4">T4</option>
                                </Form.Select>
                              </Form.Group>
                            </div>
  
                            <div className="schedule-editor">
                              <h5>🕒 수업 시간표</h5>
                              {student.schedule.map((item, i) => (
                                <div key={i}>
                                  <strong>{item.day}</strong>
                                  <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={item.start ?? ""}
                                    onChange={(e) => {
                                      const updated = [...student.schedule];
                                      updated[i].start = e.target.value;
                                      handleScheduleUpdate(student.id, updated);
                                    }}
                                    style={{ width: 50, margin: "0 5px" }}
                                  />
                                  ~
                                  <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={item.end ?? ""}
                                    onChange={(e) => {
                                      const updated = [...student.schedule];
                                      updated[i].end = e.target.value;
                                      handleScheduleUpdate(student.id, updated);
                                    }}
                                    style={{ width: 50, marginLeft: 5 }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
  
                          <Button
                            variant="danger"
                            className="mt-3"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            삭제하기
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default Students;