import React, { useState, useEffect } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";
import "./Notices.css";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [username, setUsername] = useState(""); // 현재 로그인한 사용자 이름

  // 로컬스토리지에서 기존 공지 불러오기, 추후 공지를 firebase에 저장해서 불러 올 예정(모든관리자가 볼 수 있도록)
  useEffect(() => {
    const storedNotices = JSON.parse(localStorage.getItem("notices")) || [];
    setNotices(storedNotices);

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // 공지 추가
  const handleAddNotice = () => {
    if (!newNotice.trim()) return;

    const newNoticeObject = {
      text: newNotice,
      author: username || "알 수 없음", // 로그인한 사용자 이름 추가
      timestamp: new Date().toLocaleString(), // 작성 시간 추가
    };

    const updatedNotices = [...notices, newNoticeObject];
    setNotices(updatedNotices);
    localStorage.setItem("notices", JSON.stringify(updatedNotices));
    setNewNotice("");
  };

  // 엔터 키 입력 시 공지 추가 (버튼과 같은 효과)
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddNotice();
    }
  };

  // 공지 삭제 (admin은 모든 공지 삭제 가능, 일반 사용자는 본인 글만 삭제 가능)
  const handleDeleteNotice = (index) => {
    const noticeToDelete = notices[index];

    // 일반 사용자가 본인 글이 아닌 것을 삭제하려 하면 차단
    if (username !== "admin" && noticeToDelete.author !== username) {
      alert("본인이 작성한 공지만 삭제할 수 있습니다.");
      return;
    }

    const updatedNotices = notices.filter((_, i) => i !== index);
    setNotices(updatedNotices);
    localStorage.setItem("notices", JSON.stringify(updatedNotices));
  };

  return (
    <div className="notices-container">
      <h4>📢 공지사항</h4>

      {/* 공지 입력 폼 */}
      <Form className="d-flex gap-3">
        <Form.Control
          type="text"
          placeholder="공지 내용을 입력하세요"
          value={newNotice}
          onChange={(e) => setNewNotice(e.target.value)}
          onKeyDown={handleKeyPress} // ENTER 키
        />
        <Button onClick={handleAddNotice}>추가</Button>
      </Form>

      {/* 공지 목록 */}
      <ListGroup className="mt-3">
        {notices.map((notice, index) => (
          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
            <div>
              <p className="notice-text">{notice.text}</p>
              <small className="notice-meta">{notice.author} - {notice.timestamp}</small> {/* 작성자 및 시간 표시 */}
            </div>

            {/* 삭제 버튼 (admin이거나 본인 글일 때만 표시) */}
            {(username === "admin" || notice.author === username) && (
              <Button variant="danger" size="sm" onClick={() => handleDeleteNotice(index)}>
                삭제
              </Button>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default Notices;