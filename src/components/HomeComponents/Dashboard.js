import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, ListGroup, Modal } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./Dashboard.css";

function Dashboard() {
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [viewMode, setViewMode] = useState(null);
  const [popup, setPopup] = useState({ visible: false, data: [], title: "" });

  const hours = [13, 14, 15, 16, 17, 18, 19];
  const days = ["월", "화", "수", "목", "금"];

  const teacherMap = {
    A: ["T1"],
    B: ["T2"],
    C: ["T3"],
    D: ["T4"]
  };

  //대시보드 월별 수강생 현황, 추후 스키마 변경 후 데이터 불러와서 그래프 그릴 예정
  const chartData = [
    { month: "11", Total: 40, English: 18, Math: 22 },
    { month: "12", Total: 42, English: 20, Math: 22 },
    { month: "1", Total: 47, English: 23, Math: 24 },
    { month: "2", Total: 48, English: 24, Math: 24 },
    { month: "3", Total: 50, English: 26, Math: 24 }
  ];

  useEffect(() => {
    const storedNotices = JSON.parse(localStorage.getItem("notices")) || [];
    setNotices(storedNotices);
    setUnreadCount(storedNotices.length);

    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students-info"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    };
    fetchStudents();
  }, []);

  const getStudentCount = (day, hour) => {
    if (!viewMode) return 0;
    return students.filter((s) => {
      if (!s.schedule) return false;
      return s.schedule.some((item) => {
        if (!item || !item.day || item.start == null || item.end == null) return false;
        const matchHour = item.start <= hour && item.end > hour;
        if (viewMode === "english") return !item.day.includes("수학") && item.day === day && matchHour;
        if (viewMode === "math") return item.day.includes("수학") && item.day === `${day}_수학` && matchHour;
        if (["A", "B", "C", "D"].includes(viewMode)) {
          const teacherKeys = teacherMap[viewMode];
          const isTeacherMatch = (teacherKeys.includes(s.eng_T) || teacherKeys.includes(s.math_T));
          const isTimeMatch = (item.day === day || item.day === `${day}_수학`) && matchHour;
          return isTeacherMatch && isTimeMatch;
        }
        return false;
      });
    }).length;
  };

  const getPopupData = (day, hour) => {
    const data = [];
    students.forEach((s) => {
      s.schedule.forEach((item) => {
        if (!item || !item.day || item.start == null || item.end == null) return;
        const matchHour = item.start <= hour && item.end > hour;
        const gradeName = `${s.grade} ${s.name}`;
        if (viewMode === "english" && !item.day.includes("수학") && item.day === day && matchHour) {
          data.push({ subject: "영어", name: gradeName });
        }
        if (viewMode === "math" && item.day.includes("수학") && item.day === `${day}_수학` && matchHour) {
          data.push({ subject: "수학", name: gradeName });
        }
        if (["A", "B", "C", "D"].includes(viewMode)) {
          const teacherKeys = teacherMap[viewMode];
          const isTeacherMatch = (teacherKeys.includes(s.eng_T) || teacherKeys.includes(s.math_T));
          const isTimeMatch = (item.day === day || item.day === `${day}_수학`) && matchHour;
          if (isTeacherMatch && isTimeMatch) {
            data.push({ subject: item.day.includes("수학") ? "수학" : "영어", name: gradeName });
          }
        }
      });
    });
    return data;
  };

  const renderTimetable = () => (
    <table className="schedule-table mt-4">
      <thead>
        <tr>
          <th style={{ backgroundColor: viewMode === "math" ? "#d3eaff" : viewMode === "english" ? "#fcd6c4" : "#d7f7db" }}>{viewMode === "english" ? "영어" : viewMode === "math" ? "수학" : `선생님 ${viewMode}`}</th>
          {days.map((d) => (<th key={d}>{d}</th>))}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour) => (
          <tr key={hour}>
            <td>{`${hour}:00`}</td>
            {days.map((day) => (
              <td key={`${day}-${hour}`} className="schedule-cell" onClick={() => setPopup({ visible: true, data: getPopupData(day, hour), title: `${day}요일 ${hour}:00` })}>
                {getStudentCount(day, hour) || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="dashboard-scroll-container">
      <Container>
        <h3>📊 대시보드</h3>
        <p>여기는 대시보드입니다. 전체적인 요약 정보를 볼 수 있습니다.</p>

        {/* 수강생 현황 */}
        <Row className="mb-4">
          <Col md={4}>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend align="center" verticalAlign="bottom" />
                  <Line type="monotone" dataKey="Total" stroke="blue" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="chart-label">전체 수강생 현황</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend align="center" verticalAlign="bottom" />
                  <Line type="monotone" dataKey="English" stroke="red" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="chart-label">영어 수강생 현황</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend align="center" verticalAlign="bottom" />
                  <Line type="monotone" dataKey="Math" stroke="green" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="chart-label">수학 수강생 현황</p>
            </div>
          </Col>
        </Row>

        {/* 공지사항 */}
        <h5>📢 공지사항 <span className="text-danger fw-bold">{unreadCount}</span></h5>
        <ListGroup className="mb-4">
          {notices.length > 0 ? (
            notices.slice(0, 4).map((notice, index) => (
              <ListGroup.Item key={index}>
                <strong>{notice.text}</strong><br />
                <small>{notice.author} - {notice.timestamp}</small>
              </ListGroup.Item>
            ))
          ) : (
            <p>📌 공지사항이 없습니다.</p>
          )}
        </ListGroup>

        {/* 시간표 버튼 */}
        <h5 className="d-flex align-items-center mb-4">
          📅 과목 별 시간표
          <div className="ms-5 d-flex gap-4">
            <Button variant="danger" onClick={() => setViewMode("english")}>영어</Button>
            <Button variant="primary" onClick={() => setViewMode("math")}>수학</Button>
          </div>
        </h5>

        <h5 className="d-flex align-items-center">
          🧑‍🏫 선생님 별 시간표
          <div className="ms-5 d-flex gap-4">
            <Button variant="success" onClick={() => setViewMode("A")}>선생님A</Button>
            <Button variant="success" onClick={() => setViewMode("B")}>선생님B</Button>
            <Button variant="success" onClick={() => setViewMode("C")}>선생님C</Button>
            <Button variant="success" onClick={() => setViewMode("D")}>선생님D</Button>
          </div>
        </h5>

        {viewMode && renderTimetable()}

        <Modal show={popup.visible} onHide={() => setPopup({ ...popup, visible: false })} centered>
          <Modal.Header closeButton>
            <Modal.Title>{popup.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {popup.data.length > 0 ? (
              <ul>
                {popup.data.map((entry, idx) => (
                  <li key={idx}>{entry.subject} - {entry.name}</li>
                ))}
              </ul>
            ) : (
              <p>해당 시간에 수업 듣는 학생이 없습니다.</p>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default Dashboard;