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

  return (
    <div>
      <div className="students-header">
        <h3 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          👨‍🎓 학생 목록
          <span style={{ fontSize: "16px", color: "#888", fontWeight: "normal" }}>
            ※ 이름 클릭하여 정보 수정 가능
          </span>
        </h3>
      </div>





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