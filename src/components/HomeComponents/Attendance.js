import React, { useContext, useState } from "react";
import { FirestoreContext } from "../../context/FirestoreContext"; // 전역 상태 가져오기
import { Table, Button, Form } from "react-bootstrap";
import "./Attendance.css"; // CSS 파일

function Attendance() {
  const { students, loading } = useContext(FirestoreContext); // Firestore에서 데이터 가져오기
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedSchool, setSelectedSchool] = useState(""); 
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // 오늘 날짜
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // 학생 목록 필터링
  const filteredStudents = students.filter((student) => {
    return (
      (selectedSchool === "" || student.school === selectedSchool) &&
      (selectedGrade === "" || student.grade === selectedGrade) &&
      (selectedSubject === "" ||
        (selectedSubject === "영어" && student.english) ||
        (selectedSubject === "수학" && student.math) ||
        (selectedSubject === "둘 다" && student.english && student.math))
    );
  });

  return (
    <div className="attendance-container">
      <h3>📅 출석 체크</h3>
      <p>학생들의 출석 상태를 확인하고 기록할 수 있습니다.</p>

      {loading ? (
        <p>⏳ 데이터를 불러오는 중...</p>
      ) : (
        <>
          <div className="attendance-table-container">
            <Table bordered className="attendance-table">
              <thead>
                <tr>
                  <th>학교</th>
                  <th>학년</th>
                  <th>이름</th>
                  <th>날짜</th>
                  <th>영어</th>
                  <th>수학</th>
                  <th>출석</th>
                  <th>지각</th>
                  <th>결석</th>
                  <th>전화번호</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.school}</td>
                    <td>{student.grade}</td>
                    <td>{student.name}</td>
                    <td>{formattedDate}</td>
                    <td className={`subject-cell ${student.english ? "english" : "no-subject"}`}>영어</td>
                    <td className={`subject-cell ${student.math ? "math" : "no-subject"}`}>수학</td>
                    <td>
                      <Button
                        className={`attendance-btn present ${attendanceStatus[student.id] === "출석" ? "selected" : ""}`}
                        onClick={() => setAttendanceStatus({ ...attendanceStatus, [student.id]: "출석" })}
                      >
                        출석
                      </Button>
                    </td>
                    <td>
                      <Button
                        className={`attendance-btn late ${attendanceStatus[student.id] === "지각" ? "selected" : ""}`}
                        onClick={() => setAttendanceStatus({ ...attendanceStatus, [student.id]: "지각" })}
                      >
                        지각
                      </Button>
                    </td>
                    <td>
                      <Button
                        className={`attendance-btn absent ${attendanceStatus[student.id] === "결석" ? "selected" : ""}`}
                        onClick={() => setAttendanceStatus({ ...attendanceStatus, [student.id]: "결석" })}
                      >
                        결석
                      </Button>
                    </td>
                    <td>{student.phone}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export default Attendance;