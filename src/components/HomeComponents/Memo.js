import React, { useState } from "react";
import "./Memo.css";

const colors = [
    "var(--memo-red)",
    "var(--memo-orange)",
    "var(--memo-yellow)",
    "var(--memo-green)",
    "var(--memo-blue)",
    "var(--memo-indigo)",
    "var(--memo-purple)"
];

function Memo() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [memos, setMemos] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleSave = () => {
        if (!title.trim()) return; // 제목 X -> 저장 X

        if (editingIndex !== null) {
            //수정 모드일 경우 기존 색상 유지
            setMemos(prevMemos =>
                prevMemos.map((memo, index) =>
                    index === editingIndex
                        ? { ...memo, title, content }
                        : memo
                )
            );
            setEditingIndex(null); // 수정 모드 해제
        } else {
            // 새 메모 추가 (6가지 색상 순환)
            const colorIndex = memos.length % colors.length;
            setMemos([...memos, { title, content, color: colors[colorIndex] }]);
        }

        setTitle(""); // 입력값 초기화
        setContent("");
    };

    const handleEdit = (index) => {
        const memo = memos[index];
        setTitle(memo.title);
        setContent(memo.content);
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            setMemos(prevMemos => prevMemos.filter((_, i) => i !== index));
        }
    };

    return (
        <div>
            <h3>📝 메모</h3>

            {/* 제목 + 내용 */}
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

            {/* 버튼 */}
            <div className="memo-buttons">
                <button className="memo-save-btn" onClick={handleSave}>
                    {editingIndex !== null ? "수정 완료" : "저장"}
                </button>
                <button className="memo-reset-btn" onClick={() => { setTitle(""); setContent(""); setEditingIndex(null); }}>
                    초기화
                </button>
            </div>

            {/* 메모 목록 */}
            <div className="memo-list">
                {memos.map((memo, index) => (
                    <div key={index} className="memo-item" style={{ backgroundColor: memo.color }}>
                        <span className="memo-text">({index + 1}) <b>{memo.title}</b></span>
                        <div className="memo-actions">
                            <button className="edit-btn" onClick={() => handleEdit(index)}>수정</button>
                            <button className="delete-btn" onClick={() => handleDelete(index)}>삭제</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Memo;