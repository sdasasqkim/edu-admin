import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  doc,
  query,
  where,
  orderBy,
  getDoc
} from "firebase/firestore";
import "./Memo.css";

const colors = [
  "var(--memo-red)",
  "var(--memo-orange)",
  "var(--memo-yellow)",
  "var(--memo-green)",
  "var(--memo-blue)",
  "var(--memo-indigo)",
  "var(--memo-purple)",
];

function Memo() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [memos, setMemos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUserIdAndMemos = async () => {
      const storedUid = localStorage.getItem("uid");
      if (!storedUid) return;

      const adminSnap = await getDoc(doc(db, "admin", storedUid));
      if (!adminSnap.exists()) return;

      const adminData = adminSnap.data();
      const idField = adminData.id;
      setUserId(idField);
      setUsername(idField);

      const q = query(
        collection(db, "memo"),
        where("author", "==", idField),
        orderBy("createdAt")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));
        setMemos(data);
      });

      return () => unsubscribe();
    };

    fetchUserIdAndMemos();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return;

    if (editingId !== null) {
      const ref = doc(db, "memo", editingId);
      await updateDoc(ref, { title, content });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "memo"), {
        title,
        content,
        author: userId,
        createdAt: new Date(),
      });
    }

    setTitle("");
    setContent("");
  };

  const handleEdit = (docId) => {
    const memo = memos.find((m) => m.docId === docId);
    if (memo) {
      setTitle(memo.title);
      setContent(memo.content);
      setEditingId(docId);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "memo", docId));
    }
  };

  return (
    <div>
      <h3>📝 메모</h3>

      <div className="memo-container">
        <input
          type="text"
          className="memo-title"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="memo-textarea"
          placeholder="메모를 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="memo-buttons">
        <button className="memo-save-btn" onClick={handleSave}>
          {editingId !== null ? "수정 완료" : "저장"}
        </button>
        <button
          className="memo-reset-btn"
          onClick={() => {
            setTitle("");
            setContent("");
            setEditingId(null);
          }}
        >
          초기화
        </button>
      </div>

      <div className="memo-list">
        {memos.map((memo, index) => (
          <div
            key={memo.docId}
            className="memo-item"
            style={{ backgroundColor: colors[index % colors.length] }}
          >
            <span className="memo-text">
              ({index + 1}) <b>{memo.title}</b>
            </span>
            <div className="memo-actions">
              <button className="edit-btn" onClick={() => handleEdit(memo.docId)}>수정</button>
              <button className="delete-btn" onClick={() => handleDelete(memo.docId)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Memo;
