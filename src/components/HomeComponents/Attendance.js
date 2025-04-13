import React, { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "../../context/FirestoreContext";
import { Table, Button } from "react-bootstrap";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./Attendance.css";

function Attendance() {
  const { students, loading } = useContext(FirestoreContext);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [fetchStatus, setFetchStatus] = useState("출석 상태 불러오는 중...");

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0]; // YYYY-MM-DD

  useEffect(() => {
    const fetchAttendance = async () => {
      const newStatus = {};
      try {
        for (const student of students) {
          const studentRef = doc(db, "students-info", student.firestoreId);
          const studentSnap = await getDoc(studentRef);

          if (studentSnap.exists()) {
            const data = studentSnap.data();
            const statusCode = data.attendance?.[todayKey];
            if (statusCode === "A") newStatus[student.firestoreId] = "출석";
            else if (statusCode === "B") newStatus[student.firestoreId] = "지각";
            else if (statusCode === "C") newStatus[student.firestoreId] = "결석";
          }
        }
        setAttendanceStatus(newStatus);
        setFetchStatus("출석 상태 불러오기 완료 ✅");
      } catch (error) {
        console.error("출석 데이터 불러오기 실패:", error);
        setFetchStatus("❌ 불러오기 실패");
      }
    };

    if (!loading) fetchAttendance();
  }, [students, loading, todayKey]);

  const updateAttendance = async (firestoreId, code, label) => {
    // 👉 UI 상태 먼저 업데이트
    setAttendanceStatus((prev) => ({ ...prev, [firestoreId]: label }));
  
    try {
      const ref = doc(db, "students-info", firestoreId);
      await updateDoc(ref, {
        attendance: {
          [todayKey]: code, // 오늘 날짜 출석만 유지 (덮어쓰기)
        },
      });
    } catch (error) {
      console.error("출석 상태 업데이트 실패:", error);
      setAttendanceStatus((prev) => ({ ...prev, [firestoreId]: null }));
      alert("⚠️ 출석 상태 업데이트 실패!");
    }
  };
  

  const formattedDate = today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

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
      <p className="d-flex align-items-center gap-2">
        학생들의 출석 상태를 확인하고 기록할 수 있습니다.
        <span style={{ fontSize: "14px", color: "#888" }}>
          ({fetchStatus})
        </span>
      </p>

      {loading ? (
        <p>⏳ 데이터를 불러오는 중...</p>
      ) : (
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
                <tr key={student.firestoreId}>
                  <td>{student.school}</td>
                  <td>{student.grade}</td>
                  <td>{student.name}</td>
                  <td>{formattedDate}</td>
                  <td className={`subject-cell ${student.english ? "english" : "no-subject"}`}>영어</td>
                  <td className={`subject-cell ${student.math ? "math" : "no-subject"}`}>수학</td>
                  <td>
                    <Button
                      className={`attendance-btn present ${attendanceStatus[student.firestoreId] === "출석" ? "selected" : ""}`}
                      onClick={() => updateAttendance(student.firestoreId, "A", "출석")}
                    >
                      출석
                    </Button>
                  </td>
                  <td>
                    <Button
                      className={`attendance-btn late ${attendanceStatus[student.firestoreId] === "지각" ? "selected" : ""}`}
                      onClick={() => updateAttendance(student.firestoreId, "B", "지각")}
                    >
                      지각
                    </Button>
                  </td>
                  <td>
                    <Button
                      className={`attendance-btn absent ${attendanceStatus[student.firestoreId] === "결석" ? "selected" : ""}`}
                      onClick={() => updateAttendance(student.firestoreId, "C", "결석")}
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
      )}
    </div>
  );
}

export default Attendance;
