import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

import Dashboard from "./HomeComponents/Dashboard";
import Notices from "./HomeComponents/Notices";
import Students from "./HomeComponents/Students";
import Attendance from "./HomeComponents/Attendance";
import Schedule from "./HomeComponents/Schedule";
import Memo from "./HomeComponents/Memo";
import AdminPanel from "./HomeComponents/AdminPanel";

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [selectedSection, setSelectedSection] = useState("dashboard"); // 기본 선택 화면
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsAdmin(storedUsername === "admin"); // admin인지 확인
    }
  }, []);  

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <Container fluid className="home-container p-0">
      <Row className="g-0 align-items-stretch top-row">
        <Col md={2} className="d-flex align-items-center justify-content-center brand-box p-0">
          <div className="logo-wrapper">
            <h4 className="logo-text">
              <span className="edu-text">Edu</span>
              <span className="manage-text">Manage</span>
            </h4>
          </div>
        </Col>


        <Col className="d-flex align-items-center justify-content-between px-4 custom-navbar flex-grow-1 p-0">
          <Nav>
            <Nav.Link href="https://naver.com" target="_blank" className="blog-link">
              Blog
            </Nav.Link>
          </Nav>


          <div className="d-flex align-items-center gap-3">
            <span className="welcome-text">{username}님 환영합니다.</span>
            <Button className="logout-btn" onClick={handleLogout}>로그아웃</Button>
          </div>
        </Col>
      </Row>

      {/* 하단 두 개 영역 (3, 4) */}
      <Row className="g-0 vh-100">
        <Col md={2} className="bg-light p-4 shadow menu-box p-0">
          <h5>📌 대시보드 메뉴</h5>
          <Nav className="flex-column">
            <Nav.Link className={`custom-nav-link ${selectedSection === "dashboard" ? "active" : ""}`} onClick={() => setSelectedSection("dashboard")}>📊 대시보드</Nav.Link>
            <Nav.Link className={`custom-nav-link ${selectedSection === "notices" ? "active" : ""}`} onClick={() => setSelectedSection("notices")}>📢 공지사항</Nav.Link>
            <Nav.Link className={`custom-nav-link ${selectedSection === "students" ? "active" : ""}`} onClick={() => setSelectedSection("students")}>👨‍🎓 학생 관리</Nav.Link>
            <Nav.Link className={`custom-nav-link ${selectedSection === "attendance" ? "active" : ""}`} onClick={() => setSelectedSection("attendance")}>📅 출석 체크</Nav.Link>
            <Nav.Link className={`custom-nav-link ${selectedSection === "schedule" ? "active" : ""}`} onClick={() => setSelectedSection("schedule")}>📆 시간표</Nav.Link>
            <Nav.Link className={`custom-nav-link ${selectedSection === "memo" ? "active" : ""}`} onClick={() => setSelectedSection("memo")}>📝 메모</Nav.Link>

            {/* 관리자일 경우에만 "관리자 권한" 메뉴 추가 */}
            {isAdmin && (
              <Nav.Link className={`custom-nav-link ${selectedSection === "admin" ? "active" : ""}`} onClick={() => setSelectedSection("admin")}>🔑 관리자 권한</Nav.Link>
            )}
          </Nav>
        </Col>

        {/* 선택된 메뉴에 따라 동적으로 컴포넌트 렌더링 */}
        <Col className="p-4 content-box flex-grow-1 p-0">
          {selectedSection === "dashboard" && <Dashboard />}
          {selectedSection === "notices" && <Notices />}
          {selectedSection === "students" && <Students />}
          {selectedSection === "attendance" && <Attendance />}
          {selectedSection === "schedule" && <Schedule />}
          {selectedSection === "memo" && <Memo />}
          {selectedSection === "admin" && isAdmin && <AdminPanel />} {/* 관리자 전용 */}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
