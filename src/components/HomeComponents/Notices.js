import React, { useEffect, useState } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import "./Notices.css";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "");

    // 🔹 관리자 여부 확인 (admin 컬렉션에서 chk_for_admin 확인)
    const checkAdminStatus = async () => {
      if (!storedUsername) return;
      const adminRef = collection(db, "admin");
      const q = query(adminRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const match = snapshot.docs.find((doc) => doc.data().id === storedUsername);
        setIsAdmin(match?.data()?.chk_for_admin === true);
      });
      return () => unsubscribe();
    };

    checkAdminStatus();

    // 🔹 실시간 공지 목록 가져오기
    const noticesRef = collection(db, "notices");
    const q = query(noticesRef, orderBy("timestamp", "desc"));
    const unsubscribeNotices = onSnapshot(q, (snapshot) => {
      const updatedNotices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotices(updatedNotices);
    });

    return () => {
      unsubscribeNotices();
    };
  }, []);

  const handleAddNotice = async () => {
    if (!newNotice.trim()) return;

    try {
      await addDoc(collection(db, "notices"), {
        text: newNotice.trim(),
        author: username,
        timestamp: serverTimestamp(),
      });
      setNewNotice("");
    } catch (error) {
      console.error("❌ 공지 추가 오류:", error);
      alert("⚠️ 공지를 추가하는 데 실패했습니다.");
    }
  };

  const handleDeleteNotice = async (id, author) => {
    if (!isAdmin && username !== author) {
      alert("본인이 작성한 공지만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "notices", id));
      } catch (error) {
        console.error("❌ 삭제 오류:", error);
        alert("⚠️ 공지를 삭제하는 데 실패했습니다.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNotice();
    }
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
          onKeyDown={handleKeyPress}
        />
        <Button onClick={handleAddNotice}>추가</Button>
      </Form>

      {/* 공지 목록 */}
      <ListGroup className="mt-3">
        {notices.length === 0 ? (
          <p className="mt-3">📭 등록된 공지사항이 없습니다.</p>
        ) : (
          notices.map((notice) => (
            <ListGroup.Item
              key={notice.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <p className="notice-text">{notice.text}</p>
                <small className="notice-meta">
                  {notice.author} -{" "}
                  {notice.timestamp?.toDate().toLocaleString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              {(isAdmin || notice.author === username) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteNotice(notice.id, notice.author)}
                >
                  삭제
                </Button>
              )}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </div>
  );
}

export default Notices;
