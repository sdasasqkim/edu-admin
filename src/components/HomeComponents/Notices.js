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
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Notices.css";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [userId, setUserId] = useState(""); // 로그인한 사용자의 id
  const [uid, setUid] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentUid = user.uid;
        setUid(currentUid);

        const adminDoc = await getDoc(doc(db, "admin", currentUid));
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          setUserId(data.id || ""); 
          setIsAdmin(data.chk_for_admin === true);
        }
      }
    });

    const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
    const unsubscribeNotices = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotices(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotices();
    };
  }, []);

  const handleAddNotice = async () => {
    if (!newNotice.trim()) return;
    try {
      await addDoc(collection(db, "notices"), {
        text: newNotice.trim(),
        author: userId,
        uid: uid,
        timestamp: serverTimestamp(),
      });
      setNewNotice("");
    } catch (error) {
      console.error("❌ 공지 추가 오류:", error);
      alert("⚠️ 공지를 추가하는 데 실패했습니다.");
    }
  };

  const handleDeleteNotice = async (notice) => {
    if (!isAdmin && notice.author !== userId) {
      alert("본인이 작성한 공지만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "notices", notice.id));
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
              {(isAdmin || notice.author === userId) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteNotice(notice)}
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
