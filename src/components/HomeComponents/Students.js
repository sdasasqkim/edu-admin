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
  const [studentDraft, setStudentDraft] = useState(null);
  const days = ["월", "화", "수", "목", "금"];
  const fullScheduleTemplate = [
    "월", "화", "수", "목", "금",
    "월_수학", "화_수학", "수_수학", "목_수학", "금_수학"
  ].map((day) => ({ day, start: null, end: null }));
  const [newStudent, setNewStudent] = useState({
    school: "",
    grade: "",
    name: "",
    phone: "",
    english: false,
    math: false,
    in: "",
    in_math: "",
    eng_T: "",
    math_T: "",
    out: null,
    out_math: null,
    attendance: null,
    schedule: [...fullScheduleTemplate]
  });

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

  const handleResetForm = () => {
    setNewStudent({
      school: "",
      grade: "",
      name: "",
      phone: "",
      english: false,
      math: false,
      in: "",
      in_math: "",
      eng_T: "",
      math_T: "",
      schedule: [],
    });
  };
  
  const handleSaveStudent = async (student) => {
    try {
      const docRef = doc(db, "students-info", student.firestoreId);
      await updateDoc(docRef, {
        english: student.english,
        math: student.math,
        eng_T: student.eng_T,
        math_T: student.math_T,
        in: student.in || null,
        out: student.out || null,
        in_math: student.in_math || null,
        out_math: student.out_math || null,
        schedule: student.schedule,
      });
      alert("✅ 저장이 완료되었습니다!");
      await fetchStudents();
      setExpandedStudentId(null);
      setStudentDraft(null);
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("⚠️ 저장 중 오류가 발생했습니다.");
    }
  };

  const handleSaveNewStudent = async () => {
    try {
      // 기존 학생 id 중 가장 큰 값 계산
      const maxId = students.reduce((max, s) => Math.max(max, s.id || 0), 0);
      const newId = maxId + 1;
  
      // 10개 시간표 슬롯을 완성된 형태로 매핑
      const fullScheduleTemplate = [
        "월", "화", "수", "목", "금",
        "월_수학", "화_수학", "수_수학", "목_수학", "금_수학",
      ].map((day) => {
        const match = newStudent.schedule.find((s) => s.day === day);
        return match ? { day, start: Number(match.start), end: Number(match.end) } : { day, start: null, end: null };
      });
  
      // 저장할 문서 데이터
      const newDoc = {
        id: newId,
        school: newStudent.school,
        grade: newStudent.grade,
        name: newStudent.name,
        phone: newStudent.phone,
        english: newStudent.english,
        math: newStudent.math,
        in: newStudent.in || null,
        in_math: newStudent.in_math || null,
        out: null,
        out_math: null,
        attendance: null,
        eng_T: newStudent.eng_T || null,
        math_T: newStudent.math_T || null,
        schedule: fullScheduleTemplate,
      };
  
      // Firestore 등록
      await addDoc(collection(db, "students-info"), newDoc);
  
      alert("✅ 학생이 성공적으로 등록되었습니다!");
      handleResetForm(); // 입력값 초기화
      await fetchStudents(); // 목록 새로고침
    } catch (err) {
      console.error("❌ 등록 실패:", err);
      alert("⚠️ 등록 중 오류가 발생했습니다.");
    }
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
  

  const handleAddStudent = async () => {
    const maxId = Math.max(...students.map(s => s.id || 0), 0);
    const studentToAdd = {
      ...newStudent,
      id: maxId + 1,
      out: null,
      out_math: null,
      attendance: null,
    };

    try {
      await addDoc(collection(db, "students-info"), studentToAdd);
      alert("✅ 학생 등록 완료!");
      await fetchStudents();
      setShowForm(false);
      setNewStudent({
        school: "",
        grade: "",
        name: "",
        phone: "",
        english: false,
        math: false,
        in: "",
        in_math: "",
        eng_T: "",
        math_T: "",
        out: null,
        out_math: null,
        attendance: null,
        schedule: [...fullScheduleTemplate]
      });
    } catch (err) {
      console.error("❌ 등록 실패:", err);
      alert("등록 중 오류 발생");
    }
  };

  return (
    <div>
      <div className="students-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h3>👨‍🎓 학생 목록</h3>
          <span style={{ fontSize: "14px", color: "#888" }}>이름 클릭하여 정보 수정 가능</span>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "등록 닫기" : "학생 등록"}
        </Button>
      </div>

      {showForm && (

        <div className="student-form-container">
          <div className="student-form-wrapper" style={{ display: "flex", gap: "40px" }}>
            {/* 왼쪽 2/3 입력 필드 */}
            <div style={{ flex: 1 }}>
              <h4>➕ 새 학생 등록</h4>

              <Form.Control
                type="text"
                placeholder="학교 (예: 초등학교)"
                value={newStudent.school}
                onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
                className="mb-2"
              />
              <Form.Control
                type="text"
                placeholder="학년 (예: 1학년)"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                className="mb-2"
              />
              <Form.Control
                type="text"
                placeholder="이름"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="mb-2"
              />
              <Form.Control
                type="text"
                placeholder="000-0000-0000"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                className="mb-4"
              />

              {/* 영어 수강 줄 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <Form.Check
                  type="checkbox"
                  label="영어 수강"
                  checked={newStudent.english}
                  onChange={(e) => setNewStudent({ ...newStudent, english: e.target.checked })}
                />
                {newStudent.english && (
                  <>
                    <Form.Control
                      type="text"
                      placeholder="English_입회일"
                      value={newStudent.in || ""}
                      onChange={(e) => setNewStudent({ ...newStudent, in: e.target.value })}
                      style={{ width: "160px" }}
                    />
                    <Form.Select
                      value={newStudent.eng_T || ""}
                      onChange={(e) => setNewStudent({ ...newStudent, eng_T: e.target.value })}
                      style={{ width: "160px" }}
                    >
                      <option value="">영어 선생님</option>
                      <option value="T1">T1</option>
                      <option value="T2">T2</option>
                    </Form.Select>
                  </>
                )}
              </div>

              {/* 수학 수강 줄 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <Form.Check
                  type="checkbox"
                  label="수학 수강"
                  checked={newStudent.math}
                  onChange={(e) => setNewStudent({ ...newStudent, math: e.target.checked })}
                />
                {newStudent.math && (
                  <>
                    <Form.Control
                      type="text"
                      placeholder="Math_입회일"
                      value={newStudent.in_math || ""}
                      onChange={(e) => setNewStudent({ ...newStudent, in_math: e.target.value })}
                      style={{ width: "160px" }}
                    />
                    <Form.Select
                      value={newStudent.math_T || ""}
                      onChange={(e) => setNewStudent({ ...newStudent, math_T: e.target.value })}
                      style={{ width: "160px" }}
                    >
                      <option value="">수학 선생님</option>
                      <option value="T3">T3</option>
                      <option value="T4">T4</option>
                    </Form.Select>
                  </>
                )}
              </div>

              
            </div>

            {/* 오른쪽 1/3 시간표 */}
            <div style={{ flex: 1, marginLeft:20}}>
              <h5>🕒 수업 시간표</h5>
              {["월", "화", "수", "목", "금"].map((day) => (
                <div key={day + "_eng"} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                  <strong style={{ width: "80px" }}>{day}_Eng</strong>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="시작"
                    style={{ width: 60, margin: "0 5px" }}
                    value={(newStudent.schedule.find(s => s.day === day)?.start) || ""}
                    onChange={(e) => handleScheduleChange(day, "start", e.target.value)}
                  />
                  ~
                  <input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="종료"
                    style={{ width: 60, marginLeft: 5 }}
                    value={(newStudent.schedule.find(s => s.day === day)?.end) || ""}
                    onChange={(e) => handleScheduleChange(day, "end", e.target.value)}
                  />
                </div>
              ))}
              {["월", "화", "수", "목", "금"].map((day) => {
                const mathDay = `${day}_수학`;
                return (
                  <div key={mathDay} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                    <strong style={{ width: "80px" }}>{day}_Math</strong>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="시작"
                      style={{ width: 60, margin: "0 5px" }}
                      value={(newStudent.schedule.find(s => s.day === mathDay)?.start) || ""}
                      onChange={(e) => handleScheduleChange(mathDay, "start", e.target.value)}
                    />
                    ~
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="종료"
                      style={{ width: 60, marginLeft: 5 }}
                      value={(newStudent.schedule.find(s => s.day === mathDay)?.end) || ""}
                      onChange={(e) => handleScheduleChange(mathDay, "end", e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>


              {/* 저장 및 초기화 버튼 */}
        <div className="mt-3">
          <Button variant="success" onClick={handleSaveNewStudent} style={{ marginRight: 10 }}>
            저장하기
          </Button>
          <Button variant="secondary" onClick={handleResetForm}>
            초기화
          </Button>
        </div>
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
                <React.Fragment key={student.firestoreId}>
                  <tr>
                    <td
                      style={{ cursor: "pointer", backgroundColor:"#f1f1f1" }}
                      onClick={() => {
                        if (expandedStudentId === student.firestoreId) {
                          setExpandedStudentId(null);
                          setStudentDraft(null);
                        } else {
                          setExpandedStudentId(student.firestoreId);
                          setStudentDraft({ ...student });
                        }
                      }}
                    >
                      {student.name}
                    </td>
                    <td>{student.school}</td>
                    <td>{student.grade}</td>
                    <td>{student.english ? "✅" + student.eng_T : "❌ 미수강"}</td>
                    <td>{student.math ? "✅" + student.math_T : "❌ 미수강"}</td>
                    <td>{student.phone}</td>
                  </tr>
                  {expandedStudentId === student.firestoreId && studentDraft && (
                    <tr>
                      <td colSpan="6">
                        <div className="expanded-student">
                          <div
                            className="student-detail-wrapper"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "40px",
                              alignItems: "flex-start",
                            }}
                          >
                            <div className="subject-settings" style={{ flex: 1 }}>
                              <Form.Check
                                type="checkbox"
                                label="영어 수강 여부"
                                checked={studentDraft.english}
                                onChange={(e) =>
                                  setStudentDraft((prev) => ({
                                    ...prev,
                                    english: e.target.checked,
                                  }))
                                }
                              />
                              <Form.Group className="teacher-select">
                                <Form.Label>영어 선생님</Form.Label>
                                <Form.Select
                                  value={studentDraft.eng_T || ""}
                                  onChange={(e) =>
                                    setStudentDraft((prev) => ({
                                      ...prev,
                                      eng_T: e.target.value,
                                    }))
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
                                checked={studentDraft.math}
                                onChange={(e) =>
                                  setStudentDraft((prev) => ({
                                    ...prev,
                                    math: e.target.checked,
                                  }))
                                }
                              />
                              <Form.Group className="teacher-select">
                                <Form.Label>수학 선생님</Form.Label>
                                <Form.Select
                                  value={studentDraft.math_T || ""}
                                  onChange={(e) =>
                                    setStudentDraft((prev) => ({
                                      ...prev,
                                      math_T: e.target.value,
                                    }))
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

                            <div className="student-dates" style={{ flex: 1, lineHeight: "2.4" }}>
                              <Form.Group className="mb-2">
                                <Form.Label>영어 입회일:</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={studentDraft.in || ""}
                                  onChange={(e) =>
                                    setStudentDraft((prev) => ({
                                      ...prev,
                                      in: e.target.value,
                                    }))
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="mb-2">
                                <Form.Label>영어 휴회일:</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={studentDraft.out || ""}
                                  onChange={(e) =>
                                    setStudentDraft((prev) => ({
                                      ...prev,
                                      out: e.target.value,
                                    }))
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="mb-2">
                                <Form.Label>수학 입회일:</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={studentDraft.in_math || ""}
                                  onChange={(e) =>
                                    setStudentDraft((prev) => ({
                                      ...prev,
                                      in_math: e.target.value,
                                    }))
                                  }
                                />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>수학 휴회일:</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={studentDraft.out_math || ""}
                                  onChange={(e) =>
                                    setStudentDraft((prev) => ({
                                      ...prev,
                                      out_math: e.target.value,
                                    }))
                                  }
                                />
                              </Form.Group>
                            </div>

                            <div className="schedule-editor" style={{ flex: 1 }}>
                              <h5>🕒 수업 시간표</h5>
                              {studentDraft.schedule.map((item, i) => (
                                <div key={i} style={{ marginBottom: 6 }}>
                                  <strong>
                                    {item.day.includes("수학")
                                      ? item.day.replace("_수학", "_Math")
                                      : `${item.day}_Eng`}
                                  </strong>
                                  <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={item.start ?? ""}
                                    onChange={(e) => {
                                      const updated = [...studentDraft.schedule];
                                      updated[i].start = e.target.value;
                                      setStudentDraft((prev) => ({
                                        ...prev,
                                        schedule: updated,
                                      }));
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
                                      const updated = [...studentDraft.schedule];
                                      updated[i].end = e.target.value;
                                      setStudentDraft((prev) => ({
                                        ...prev,
                                        schedule: updated,
                                      }));
                                    }}
                                    style={{ width: 50, marginLeft: 5 }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                            <Button
                              variant="success"
                              onClick={() => handleSaveStudent(studentDraft)}
                              style={{ marginRight: 10 }}
                            >
                              저장하기
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteStudent(student.firestoreId)}
                            >
                              삭제하기
                            </Button>
                          </div>
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