import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, ListGroup, Modal } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./Dashboard.css";

function Dashboard() {
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState(null);
  const [popup, setPopup] = useState({ visible: false, data: [], title: "" });
  const containerRef = useRef(null);

  const hours = [13, 14, 15, 16, 17, 18, 19];
  const days = ["월", "화", "수", "목", "금"];
  const teacherMap = {
    A: ["T1"], B: ["T2"], C: ["T3"], D: ["T4"]
  };

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const fetchedNotices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotices(fetchedNotices);
      setUnreadCount(fetchedNotices.length);

      const studentSnapshot = await getDocs(collection(db, "students-info"));
      const studentData = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
      generateChartData(studentData);
    };

    fetchData();
  }, []);

  const handleViewModeClick = (mode) => {
    setViewMode(mode);
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
      }
    }, 100);
  };

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

  const generateChartData = (students) => {
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const months = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() - 3 + i);
      return d;
    });

    const data = months.map((dateObj) => {
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      const monthStr = `${month}`.padStart(2, "0");
      const cutoff = Number(`${year}${monthStr}01`.slice(2));

      let total = 0, english = 0, math = 0;

      students.forEach((s) => {
        if (s.english && s.in && s.in <= cutoff && (!s.out || s.out >= cutoff)) {
          english++;
          total++;
        }
        if (s.math && s.in_math && s.in_math <= cutoff && (!s.out_math || s.out_math >= cutoff)) {
          math++;
          total++;
        }
      });

      return {
        month: monthStr,
        Total: total,
        English: english,
        Math: math,
      };
    });

    setChartData(data);
  };

  const getMaxY = (key) => Math.max(...chartData.map(d => d[key] || 0)) + 2;

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
    <div className="dashboard-scroll-wrapper" ref={containerRef}>
      <Container>
        <h3>📊 대시보드</h3>
        <p>여기는 대시보드입니다. 전체적인 요약 정보를 볼 수 있습니다.</p>

        <Row className="mb-4">
          {[
            { key: "Total", label: "전체", color: "blue" },
            { key: "English", label: "영어", color: "red" },
            { key: "Math", label: "수학", color: "green" },
          ].map(({ key, label, color }) => (
            <Col md={4} key={key}>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, getMaxY(key)]} />
                    <Tooltip />
                    <Legend align="center" verticalAlign="bottom" />
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      isAnimationActive={false} // 선이 왼쪽에서 그려지지 않도록
                      className="fade-line"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="chart-label">{label} 수강생 현황</p>
              </div>
            </Col>
          ))}
        </Row>

        <div className="d-flex align-items-center justify-content-between">
          <h5>
            📢 공지사항 <span className="text-danger fw-bold">{unreadCount}</span>
            <span className="text-muted small ms-2">※ 최대 4개 표시</span>
          </h5>
        </div>

        <ListGroup className="mb-4">
          {notices.length > 0 ? (
            notices.slice(0, 4).map((notice, index) => (
              <ListGroup.Item key={index}>
                <strong>{notice.text}</strong><br />
                <small>{notice.author} - {notice.timestamp.toDate().toLocaleString("ko-KR")}</small>
              </ListGroup.Item>
            ))
          ) : (
            <p>📌 공지사항이 없습니다.</p>
          )}
        </ListGroup>

        <h5 className="d-flex align-items-center mb-4">
          📅 과목 별 시간표
          <div className="ms-5 d-flex gap-4">
            <Button variant="danger" onClick={() => handleViewModeClick("english")}>영어</Button>
            <Button variant="primary" onClick={() => handleViewModeClick("math")}>수학</Button>
          </div>
        </h5>

        <h5 className="d-flex align-items-center">
          🧑‍🏫 선생님 별 시간표
          <div className="ms-5 d-flex gap-4">
            <Button variant="success" onClick={() => handleViewModeClick("A")}>선생님A</Button>
            <Button variant="success" onClick={() => handleViewModeClick("B")}>선생님B</Button>
            <Button variant="success" onClick={() => handleViewModeClick("C")}>선생님C</Button>
            <Button variant="success" onClick={() => handleViewModeClick("D")}>선생님D</Button>
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
