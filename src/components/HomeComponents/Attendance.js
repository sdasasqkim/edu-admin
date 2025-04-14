import React, { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "../../context/FirestoreContext";
import { Table, Button, Form } from "react-bootstrap";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./Attendance.css";

function Attendance() {
  const { students, loading } = useContext(FirestoreContext);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("수업 있는 학생만");
  const [fetchStatus, setFetchStatus] = useState("출석 상태 불러오는 중...");

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const daysKor = ["일", "월", "화", "수", "목", "금", "토"];
  const todayDay = daysKor[today.getDay()];
  const todayCutoff = Number(
    `${String(today.getFullYear()).slice(2)}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
  );

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
    setAttendanceStatus((prev) => ({ ...prev, [firestoreId]: label }));
    try {
      const ref = doc(db, "students-info", firestoreId);
      await updateDoc(ref, {
        attendance: {
          [todayKey]: code,
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

  const getGradeValue = (school, grade) => {
    const num = parseInt(grade);
    if (school === "초등학교") return num;
    if (school === "중학교") return 6 + num;
    if (school === "고등학교") return 9 + num;
    return 99;
  };

  const filteredStudents = students
    .filter((student) => {
      const schedule = student.schedule || [];
      const hasClassToday = schedule.some(
        (s) => (s.day === todayDay || s.day === `${todayDay}_수학`) && s.start !== null && s.end !== null
      );

      const isEnglishActive = student.english && student.in && student.in <= todayCutoff && (!student.out || student.out >= todayCutoff);
      const isMathActive = student.math && student.in_math && student.in_math <= todayCutoff && (!student.out_math || student.out_math >= todayCutoff);

      if (selectedFilter === "전체") {
        return student.english || student.math;
      }

      if (selectedFilter === "영어") {
        return student.english;
      }

      if (selectedFilter === "수학") {
        return student.math;
      }

      return hasClassToday && (isEnglishActive || isMathActive);
    })
    .sort((a, b) => {
      const aVal = getGradeValue(a.school, a.grade);
      const bVal = getGradeValue(b.school, b.grade);
      return aVal - bVal;
    });

  const renderSubjectCell = (subject, isActive) => {
    return (
      <span className={`subject-cell ${subject} ${isActive ? subject : "no-subject"}`} style={{ textDecoration: isActive ? "none" : "none" }}>
        {subject === "english" ? "영어" : "수학"}
      </span>
    );
  };

  return (
    <div className="attendance-container">
      <h3>📅 출석 체크</h3>
      <p className="d-flex align-items-center gap-2">
        학생들의 출석 상태를 확인하고 기록할 수 있습니다.
        <span style={{ fontSize: "20px", color: "#888" }}>({fetchStatus})</span>
      </p>

      <div className="mb-3">
        <Form.Select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          style={{ maxWidth: "200px", marginLeft: "10px" }}
        >
          <option value="수업 있는 학생만">수업 있는 학생만</option>
          <option value="전체">전체</option>
          <option value="영어">영어</option>
          <option value="수학">수학</option>
        </Form.Select>
      </div>

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
              {filteredStudents.map((student) => {
                const isEnglishActive = student.english && student.in && student.in <= todayCutoff && (!student.out || student.out >= todayCutoff);
                const isMathActive = student.math && student.in_math && student.in_math <= todayCutoff && (!student.out_math || student.out_math >= todayCutoff);
                return (
                  <tr key={student.firestoreId}>
                    <td>{student.school}</td>
                    <td>{student.grade}</td>
                    <td>{student.name}</td>
                    <td>{formattedDate}</td>
                    <td>{renderSubjectCell("english", isEnglishActive)}</td>
                    <td>{renderSubjectCell("math", isMathActive)}</td>
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
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default Attendance;